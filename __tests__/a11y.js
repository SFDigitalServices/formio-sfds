/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'

// FIXME: we import the built bundle because we aren't (yet)
// telling jest to process our JS with rollup, which is where
// all of the EJS stuff happens.
import '../dist/formio-sfds.standalone.js'

describe('a11y', () => {
  describe('input labels', () => {
    it('single textfield has an associated label', async () => {
      const form = await createForm({
        type: 'form',
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name',
            input: true
          }
        ]
      }, {
        debug: false
      })

      const component = form.getComponent('name')
      expect(component).not.toBe(null)

      const id = `input-${component.id}`
      const input = form.element.querySelector(`input[id="${id}"]`)
      expect(input).not.toBe(null, `No input found with id="${id}"`)
      const label = form.element.querySelector(`label[for="${id}"]`)
      expect(label).not.toBe(null, `No label found with for="${id}"`)

      destroyForm(form)
    })

    it('nested inputs have associated labels', async () => {
      const form = await createForm({
        type: 'form',
        display: 'form',
        components: [
          {
            type: 'container',
            key: 'nested',
            components: [
              {
                type: 'number',
                key: 'age',
                label: 'Age',
                input: true
              }
            ]
          }
        ]
      }, {
        debug: false
      })

      const component = form.getComponent('age')
      expect(component).not.toBe(null)

      const id = `input-${component.id}`
      const input = form.element.querySelector(`input[id="${id}"]`)
      expect(input).not.toBe(null, `No input found with id="${id}"`)
      const label = form.element.querySelector(`label[for="${id}"]`)
      expect(label).not.toBe(null, `No label found with for="${id}"`)

      destroyForm(form)
    })

    it('select inputs have associated labels', async () => {
      const form = await createForm({
        type: 'form',
        display: 'form',
        components: [
          {
            type: 'select',
            key: 'color',
            label: 'Choose a color',
            data: {
              values: [
                { label: 'Red', value: 'red' },
                { label: 'Green', value: 'green' },
                { label: 'Blue', value: 'blue' }
              ]
            }
          }
        ]
      }, {
        debug: false
      })

      const component = form.getComponent('color')
      expect(component).not.toBe(null)

      const id = `input-${component.id}`
      const input = form.element.querySelector(`select[id="${id}"]`)
      expect(input).not.toBe(null, `No input found with id="${id}"`)
      const label = form.element.querySelector(`label[for="${id}"]`)
      expect(label).not.toBe(null, `No label found with for="${id}"`)

      destroyForm(form)
    })
  })

  describe('required attributes', () => {
    it('adds required="true" to required components', async () => {
      const form = await createForm({
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name',
            input: true,
            validate: {
              required: true
            }
          }
        ]
      }, {})

      const input = form.element.querySelector('input')
      expect(input).not.toBe(null)
      expect(input.hasAttribute('required')).toBe(true)
      expect(input.getAttribute('aria-required')).toBe('true')

      destroyForm(form)
    })

    it('does not fail without a validate prop', async () => {
      const form = await createForm({
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name',
            input: true
          }
        ]
      }, {})

      const input = form.element.querySelector('input')
      expect(input).not.toBe(null)
      expect(input.hasAttribute('required')).toBe(false)

      destroyForm(form)
    })
  })

  describe('wizard navigation', () => {
    it('adds aria-current="page" to the current page', async () => {
      const form = await createForm({
        display: 'wizard',
        components: [
          {
            type: 'panel',
            title: 'Page 1'
          },
          {
            type: 'panel',
            title: 'Page 2'
          },
          {
            type: 'panel',
            title: 'Page 3'
          }
        ]
      })

      let buttons = form.element.querySelectorAll('nav button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0].getAttribute('aria-current')).toEqual('page')
      expect(buttons[1].hasAttribute('aria-current')).toBe(false)
      expect(buttons[2].hasAttribute('aria-current')).toBe(false)

      await form.setPage(1)
      buttons = form.element.querySelectorAll('nav button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0].hasAttribute('aria-current')).toBe(false)
      expect(buttons[1].getAttribute('aria-current')).toEqual('page')
      expect(buttons[2].hasAttribute('aria-current')).toBe(false)

      await form.setPage(2)
      buttons = form.element.querySelectorAll('nav button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0].hasAttribute('aria-current')).toBe(false)
      expect(buttons[1].hasAttribute('aria-current')).toBe(false)
      expect(buttons[2].getAttribute('aria-current')).toEqual('page')
    })

    it('adds the disabled attribute to inaccessible pages', async () => {
      const form = await createForm({
        display: 'wizard',
        components: [
          {
            type: 'panel',
            title: 'Page 1'
          },
          {
            type: 'panel',
            title: 'Page 2'
          },
          {
            type: 'panel',
            title: 'Page 3'
          }
        ]
      })

      let buttons = form.element.querySelectorAll('nav button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0].disabled).toBe(false)
      expect(buttons[1].disabled).toBe(true)
      expect(buttons[2].disabled).toBe(true)

      await form.setPage(1)
      buttons = form.element.querySelectorAll('nav button')
      expect(buttons[0].disabled).toBe(false)
      expect(buttons[1].disabled).toBe(false)
      expect(buttons[2].disabled).toBe(true)

      await form.setPage(2)
      buttons = form.element.querySelectorAll('nav button')
      expect(buttons[0].disabled).toBe(false)
      expect(buttons[1].disabled).toBe(false)
      expect(buttons[2].disabled).toBe(false)
    })
  })

  describe('aria-invalid', () => {
    it('adds aria-invalid="true" to invalid components', async () => {
      const form = await createForm({
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name',
            input: true,
            validate: {
              required: true
            }
          }
        ]
      })

      const caught = jest.fn()
      try {
        await form.submit()
      } catch (error) {
        caught(error)
      }

      expect(caught).toHaveBeenCalledTimes(1)

      expect(form.components[0].isValid()).toBe(false)

      let input = form.element.querySelector('input')
      expect(input).not.toBe(null)
      expect(input.getAttribute('aria-required')).toEqual('true')
      expect(input.getAttribute('aria-invalid')).toEqual('true')

      await form.setSubmission({
        data: {
          name: 'wut'
        }
      })
      await form.redraw()

      input = form.element.querySelector('input')
      expect(input.value).toEqual('wut')
      expect(input.classList.contains('is-invalid')).toBe(false)
      expect(input.getAttribute('aria-invalid')).not.toEqual('true')

      destroyForm(form)
    })
  })
})
