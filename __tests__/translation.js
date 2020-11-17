/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'

// FIXME: we import the built bundle because we aren't (yet)
// telling jest to process our JS with rollup, which is where
// all of the EJS stuff happens.
import '../dist/formio-sfds.standalone.js'

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
})
