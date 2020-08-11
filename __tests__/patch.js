/* eslint-env jest */
import loadTranslations from '../src/i18n/load'
import patch from '../src/patch'
import { createElement, createForm, destroyForm, sleep } from '../lib/test-helpers'
import defaultTranslations from '../src/i18n'
import 'formiojs/dist/formio.full.min.js'

jest.mock('../src/i18n/load')

const { Formio } = window
const { createForm: originalCreateForm } = Formio

const SENTINEL_I18N_KEY = 'derp'
const SENTINEL_I18N_VALUE = 'DERP!'
defaultTranslations.en[SENTINEL_I18N_KEY] = SENTINEL_I18N_VALUE

describe('patch()', () => {
  beforeAll(() => {
    patch(Formio)
  })

  it('patches Formio.createForm()', () => {
    expect(Formio.createForm).not.toBe(originalCreateForm)
  })

  describe('DOM updates', () => {
    it('adds a div.formio-sfds wrapper element', async () => {
      const form = await createForm()
      expect(Array.from(form.element.parentNode.classList)).toContain('formio-sfds')
      destroyForm(form)
    })

    it('adds .d-flex.flex-column-reverse.mb-4 to the element', async () => {
      const form = await createForm()
      expect(Array.from(form.element.classList)).toEqual(
        expect.arrayContaining(['d-flex', 'flex-column-reverse', 'mb-4'])
      )
      destroyForm(form)
    })
  })

  describe('beforeunload warning', () => {
    it('does not fire if you do nothing', async () => {
      const event = new window.Event('beforeunload')
      const form = await createForm()
      window.dispatchEvent(event)
      expect(event.returnValue).toBe(true)
      destroyForm(form)
    })

    /**
     * FIXME: this doesn't work in jsdom (jest's default env), but it _does_ in
     * real browsers. There might be something different about how jsdom
     * manages window events.
     */
    xit('fires if you go to the next page', async () => {
      const event = new window.Event('beforeunload')
      const form = await createForm()
      await form.emit('nextPage', form)
      window.dispatchEvent(event)
      expect(event.returnValue).toEqual('Leave site? Changes you made may not be saved.')
      destroyForm(form)
    })

    it('does not fire if you go to the next page, then submit', async () => {
      const event = new window.Event('beforeunload')
      const form = await createForm()
      await form.emit('nextPage', form)
      await form.submit()
      window.dispatchEvent(event)
      expect(event.returnValue).toBe(true)
      destroyForm(form)
    })
  })

  describe('localization', () => {
    describe('"language" option', () => {
      it('defaults to "en" if none is provided', async () => {
        const form = await createForm()
        expect(form.options.language).toEqual('en')
        destroyForm(form)
      })

      it('uses element.lang if present', async () => {
        const lang = 'es'
        const el = createElement('div', { lang })
        document.body.appendChild(el)
        const form = await Formio.createForm(el, {})
        expect(form.options.language).toEqual(lang)
        destroyForm(form)
      })

      it('uses document.documentElement.lang if present', async () => {
        const lang = 'es'
        document.documentElement.setAttribute('lang', lang)
        const form = await createForm()
        expect(form.options.language).toEqual(lang)
        destroyForm(form)
        document.documentElement.removeAttribute('lang')
      })
    })

    describe('"i18n" option', () => {
      const mockUrl = 'http://my-translations.example.app'
      it('gets the default translations with no "i18n" option', async () => {
        const form = await createForm()
        expect(form.t(SENTINEL_I18N_KEY)).toEqual(SENTINEL_I18N_VALUE)
        destroyForm(form)
      })

      it('fetches translations from the URL if provided a string', async () => {
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({}, { i18n: mockUrl, language: 'es' })
        expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })

      it('fails gracefully if translations fail to load', async () => {
        loadTranslations.mockImplementationOnce(() => {
          throw new Error('eeeek')
        })
        const form = await createForm({}, { i18n: mockUrl, language: 'es' })
        expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
        destroyForm(form)
      })

      it('fails gracefully if translation data is malformed', async () => {
        loadTranslations.mockImplementationOnce(() => 'lolwut')
        const form = await createForm({}, { i18n: mockUrl, language: 'es' })
        expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
        destroyForm(form)
      })
    })

    describe('machine translation', () => {
      it('disables machine translation if "googleTranslate" === false', async () => {
        const form = await createForm({}, { googleTranslate: false })
        expect(form.element.getAttribute('translate')).toEqual('no')
        expect(Array.from(form.element.classList)).toContain('notranslate')
        destroyForm(form)
      })

      it('disables machine translation on .flatpickr-calendar elements', async () => {
        const el = createElement('div', { class: 'flatpickr-calendar' })
        document.body.appendChild(el)
        // selector-observer is async, so we need to wait a bit
        await sleep(50)
        expect(el.getAttribute('translate')).toEqual('no')
        expect(Array.from(el.classList)).toContain('notranslate')
        el.remove()
      })
    })
  })

  describe('form.io model patches', () => {
    describe('select component', () => {
      /**
       * FIXME: The form created in this test doesn't have any components. This
       * is the first test that actually tries to access them, so it could be
       * that the createForm() helper function isn't working properly.
       */
      it('gets .widget = "html5" by default', async () => {
        const form = await createForm({
          type: 'form',
          display: 'form',
          components: [
            {
              key: 'heyo',
              type: 'select',
              widget: 'choicesjs',
              input: true,
              data: { values: [] }
            }
          ]
        })
        expect(form.components.length).toBeGreaterThanOrEqual(1)
        const [select] = form.components
        expect(select.type).toEqual('select')
        expect(select.component.widget).toEqual('html5')
        destroyForm(form)
      })

      it('does not set .widget = "html5" if "autocomplete" tag is present', async () => {
        const form = await createForm({
          type: 'form',
          display: 'form',
          components: [
            {
              key: 'heyo',
              type: 'select',
              tags: ['autocomplete'],
              widget: 'choicesjs',
              input: true,
              data: { values: [] }
            }
          ]
        })
        expect(form.components.length).toBeGreaterThanOrEqual(1)
        const [select] = form.components
        expect(select.type).toEqual('select')
        expect(select.component.widget).toEqual('choicesjs')
        destroyForm(form)
      })
    })
  })

  describe('component markup patches', () => {
    describe('datetime component', () => {
      it('has its suffix element (.input-group-append) repurposed as a suffix (.input-group-prepend)', async () => {
        const component = createElement('div', { class: 'formio-component-datetime' })
        const group = createElement('div', { class: 'input-group' })
        component.appendChild(group)
        const suffix = createElement('div', { class: 'input-group-append' })
        group.appendChild(suffix)
        document.body.append(component)
        // selector-observer is async, so we need to wait a bit
        await sleep(50)
        expect(Array.from(suffix.classList)).not.toContain('input-group-append')
        expect(Array.from(suffix.classList)).toContain('input-group-prepend')
        expect(group.firstChild).toBe(suffix)
        component.remove()
      })
    })
  })
})
