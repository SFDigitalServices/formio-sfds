/* eslint-env jest */
import { createForm, destroyForm, sleep } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('integration tests', () => {
  describe('weird test case (fixture)', () => {
    const fixture = require('./fixtures/weird-test-case.json')

    it('properly sets the invalid state of nested elements', async () => {
      const form = await createForm(fixture)
      await form.setPage(3)
      form.element.querySelector('button[ref$=next]').click()

      await sleep(10)

      const messages = form.element.querySelectorAll('.alert [ref=errorRef]')
      expect(messages).toHaveLength(4)
      const invalid = form.element.querySelectorAll('.has-error')
      expect(invalid).toHaveLength(4)

      destroyForm(form)
    })
  })
})
