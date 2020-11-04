/* eslint-env jest */
import patch from '../src/patch'
import { createElement, createForm, destroyForm, sleep } from '../lib/test-helpers'
import 'formiojs/dist/formio.full.min.js'

const { Formio } = window
const { createForm: originalCreateForm } = Formio

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
      const form = await createForm({
        display: 'wizard',
        components: [
          {
            type: 'panel',
            title: 'Page 1',
            key: 'page1'
          },
          {
            type: 'panel',
            title: 'Page 2',
            key: 'page2'
          }
        ]
      })
      await form.nextPage()
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
