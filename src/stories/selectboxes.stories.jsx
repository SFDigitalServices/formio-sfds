import React from 'react'
import { Form } from '../react/form'

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
  label,
  values,
  language,
  translations,
  required,
  validateMessage,
  formOptions = {},
  ...rest
}) => (
  <Form
    components={[
      {
        key: 'component',
        label,
        type: 'selectboxes',
        values,
        validate: {
          required,
          customMessage: validateMessage
        },
        ...rest
      }
    ]}
    options={{
      language,
      i18n: translations,
      ...formOptions
    }}
  />
)

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
      required: true,
      validateMessage: 'Please choose at least one'
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
