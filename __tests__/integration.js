/* eslint-env jest */
import { createForm, destroyForm, sleep } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('integration tests', () => {
  describe('weird test case (fixture)', () => {
    const fixture = require('./fixtures/weird-test-case.json')

    it.skip('properly sets the invalid state of nested elements', async () => {
      const form = await createForm(fixture)

      // skip to the 4th page
      await form.setPage(3)
      // click the "Next" button
      form.element.querySelector('button[ref$=next]').click()

      // wait a tick for the invalid state to redraw
      await sleep(10)

      const messages = form.element.querySelectorAll('.alert [ref=errorRef]')
      expect(messages).toHaveLength(4)
      const invalid = form.element.querySelectorAll('.has-error')
      expect(invalid).toHaveLength(4)

      for (const message of messages) {
        const key = message.getAttribute('data-component-key')
        expect(key).not.toBe(null, `Expected a data-component-key attr, but got: ${message.outerHTML}`)
        const component = form.getComponent(key)
        expect(component).not.toBe(null, `No component found with key: "${key}"`)
        expect(component.element).not.toBe(undefined)
        const { classList } = component.element
        expect(classList.contains('has-error')).toBe(true, `Invalid component element lacks "has-error" class: ${classList}`)
      }

      destroyForm(form)
    })
  })
})
