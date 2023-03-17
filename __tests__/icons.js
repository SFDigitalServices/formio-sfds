/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('icons', () => {
  describe('<sfgov-icon> replacement', () => {
    it('replaces all .fa elements with <sfgov-icon>', async () => {
      const form = await createForm({
        components: [
          {
            name: 'Datetime',
            type: 'datetime',
            key: 'datetime'
          }
        ]
      })

      const faElements = form.element.querySelectorAll('.fa')
      expect(faElements).toHaveLength(0)
      const faCalendar = form.element.querySelectorAll('.fa-calendar')
      expect(faCalendar).toHaveLength(0)

      const icons = form.element.querySelectorAll('sfgov-icon')
      expect(icons).toHaveLength(1)
      expect(icons[0].getAttribute('symbol')).toBe('calendar')
    })

    it('preserves legacy "square" icons', async () => {
      const form = await createForm({
        components: [
          {
            name: 'Text',
            type: 'htmlelement',
            key: 'text',
            content: '<span data-icon="square"></span>'
          }
        ]
      })
      expect(form.element.querySelector('[ref=html]').innerHTML).toMatchSnapshot()
    })

    it('removes .fa and .fa-{symbol} classes', async () => {
      const form = await createForm({
        components: [
          {
            name: 'Text',
            type: 'htmlelement',
            key: 'text',
            content: '<i class="fa fa-camera"></i>'
          }
        ]
      })
      expect(form.element.querySelectorAll('.fa, .fa-camera')).toHaveLength(0)
    })
  })

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
