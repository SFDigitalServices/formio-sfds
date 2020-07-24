/* eslint-env jest */
import 'regenerator-runtime'
import loadTranslations from '../src/i18n/load'
import patch from '../src/patch'
import { createElement, createForm, destroyForm } from '../lib/test-helpers'
import defaultTranslations from '../src/i18n'
import 'formiojs/dist/formio.full.min.js'

jest.mock('../src/i18n/load')

const SENTINEL_I18N_KEY = 'derp'
const SENTINEL_I18N_VALUE = 'DERP!'
defaultTranslations.en[SENTINEL_I18N_KEY] = SENTINEL_I18N_VALUE

describe('patch()', () => {
  const { Formio } = window
  const { createForm: originalCreateForm } = Formio

  beforeAll(() => {
    patch(Formio)
  })

  it('patches Formio.createForm()', () => {
    expect(Formio.createForm).not.toBe(originalCreateForm)
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
      it('gets the default translations with no "i18n" option', async () => {
        const form = await createForm()
        expect(form.t(SENTINEL_I18N_KEY)).toEqual(SENTINEL_I18N_VALUE)
        destroyForm(form)
      })

      it('fetches translations from the URL if provided a string', async () => {
        const url = 'http://my-translations.example.app'
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({}, { i18n: url, language: 'es' })
        expect(loadTranslations).toHaveBeenCalledWith(url)
        expect(form.t('hello')).toEqual('hola')
      })
    })
  })
})
