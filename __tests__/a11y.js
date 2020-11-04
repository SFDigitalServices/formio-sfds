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
})
