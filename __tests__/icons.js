/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('icons', () => {
  describe('datetime prefix', () => {
    it('renders a calendar icon', async () => {
      const form = await createForm({
        type: 'form',
        display: 'form',
        components: [
          {
            type: 'datetime',
            label: 'Date'
          }
        ]
      }, {})

      const prepend = form.element.querySelector('.input-group-prepend')
      expect(prepend).not.toBe(null)
      expect(prepend.innerHTML).not.toContain('[object HTMLElement]')

      destroyForm(form)
    })
  })
})
