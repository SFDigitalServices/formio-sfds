/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'

// FIXME: we import the built bundle because we aren't (yet)
// telling jest to process our JS with rollup, which is where
// all of the EJS stuff happens.
import '../dist/formio-sfds.standalone.js'

describe('generic string translations', () => {
  describe('translates validation error types', () => {
    it('without custom translations', async () => {
      const form = await createForm()
      expect(form.t('required', { field: 'foo' })).toEqual('foo is required')
      await (form.language = 'es')
      expect(form.t('required', { field: 'foo' })).toEqual('foo es requerido')
    })

    it('with custom translations', async () => {
      const form = await createForm({ }, {
        i18n: {
          en: { required: 'required: {{field}}' },
          es: { foo: 'El foo' }
        }
      })
      expect(form.t('required', { field: 'foo' })).toEqual('required: foo')
      await (form.language = 'es')
      expect(form.t('required', { field: 'foo' })).toEqual('foo es requerido')
      expect(form.t('foo')).toEqual('El foo')
    })
  })
})

describe('field translations', () => {
  const component = {
    key: 'name',
    type: 'textfield',
    label: 'Name',
    description: 'Please enter your name'
  }

  it('translates labels', async () => {
    const form = await createForm({
      components: [{ ...component }]
    }, {
      language: 'es',
      i18n: {
        es: {
          'name.label': 'Nombre'
        }
      }
    })

    expect(form.i18next.language).toEqual('es')
    expect(form.t('name.label')).toEqual('Nombre')

    const label = form.element.querySelector('label:not(.control-label--hidden)')
    expect(label.textContent.trim()).toEqual('Nombre')

    destroyForm(form)
  })

  it('finds translations in component properties', async () => {
    const form = await createForm({
      components: [
        {
          properties: {
            'de:label': 'der Name'
          },
          ...component
        }
      ]
    }, {
      language: 'de'
    })

    expect(form.i18next.language).toEqual('de')
    const label = form.element.querySelector('label:not(.control-label--hidden)')
    expect(label.textContent.trim()).toEqual('der Name')
    destroyForm(form)
  })

  it('translates radio option labels', async () => {
    const form = await createForm({
      components: [
        {
          key: 'color',
          type: 'radio',
          values: [
            { value: 'red', label: 'Red' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' }
          ]
        }
      ]
    }, {
      language: 'es',
      i18n: {
        es: {
          'color.values.red': 'Rojo',
          'color.values.green': 'Verde'
        }
      }
    })

    expect(form.i18next.language).toEqual('es')
    expect(form.t('color.values.red')).toEqual('Rojo')

    const labels = form.element.querySelectorAll('fieldset label')
    expect(labels).toHaveLength(3)
    expect(labels[0].textContent.trim()).toEqual('Rojo')
    expect(labels[1].textContent.trim()).toEqual('Verde')
    // this one does not have a translation, but it should still render the English version
    expect(labels[2].textContent.trim()).toEqual('Blue')

    destroyForm(form)
  })
})
