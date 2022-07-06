import React from 'react'
import PropTypes from 'prop-types'
import { SingleComponentForm } from '../react/form'

export default {
  title: 'Checkboxes',
  description: '',
  argTypes: {
    label: {
      name: 'Label',
      description: 'The field &lt;label&gt;'
    },
    values: {
      name: 'Values',
      description: 'A list of the available choices',
      table: {
        type: { summary: 'Array<{label: \'string\', value: \'string\' }>' }
      }
    },
    required: {
      name: 'Required',
      table: {
        type: { summary: 'Boolean' }
      }
    },
    translations: {
      name: 'Translations',
      table: {
        type: { summary: 'Record<string, Record<string, string>>' }
      }
    }
  }
}

const Template = ({
  language,
  translations,
  options = {},
  required,
  validate = { required },
  ...rest
}) => (
  <SingleComponentForm
    component={{
      key: 'component',
      type: 'selectboxes',
      validate,
      ...rest
    }}
    options={{
      language,
      i18n: translations,
      ...options
    }}
  />
)

Template.propTypes = {
  language: PropTypes.string,
  translations: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.string
    )
  ),
  options: PropTypes.object,
  required: PropTypes.bool,
  validate: PropTypes.bool
}

const defaultValues = {
  label: 'Which ways?',
  autocomplete: false,
  values: [
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' }
  ],
  translations: {
    es: {
      'component.label': '¿Cuales direcciónes?',
      'component.values.up': 'Arriba',
      'component.values.down': 'Abajo',
      'component.values.left': 'Izquierda',
      'component.values.right': 'Derecho'
    }
  }
}

export const Default = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'en',
      ...defaultValues
    }
  }
)

export const Required = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'en',
      ...defaultValues,
      validate: {
        required: true,
        customMessage: 'Please choose at least one'
      }
    }
  }
)

export const Translated = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'es',
      ...defaultValues
    }
  }
)
