/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('a11y', () => {
  describe('input labels', () => {
    it('textfield inputs have associated labels', async () => {
      const form = await createForm({
        type: 'form',
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name',
            input: true
          },
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
      }, {})

      const inputs = form.element.querySelectorAll('input')
      const labels = form.element.querySelectorAll('label:not(.control-label--hidden)')
      expect(inputs).toHaveLength(2)
      expect(labels).toHaveLength(2)

      const [nameField, ageField] = inputs
      const [nameLabel, ageLabel] = labels
      expect(nameField.name).toBe('data[name]')
      expect(nameField.id).toBe(`input-${nameField.name}`)
      expect(nameLabel.getAttribute('for')).toBe(nameField.id)

      expect(ageField.name).toBe('data[nested][age]')
      expect(ageField.id).toBe(`input-${ageField.name}`)
      expect(ageLabel.getAttribute('for')).toBe(ageField.id)

      destroyForm(form)
    })
  })
})