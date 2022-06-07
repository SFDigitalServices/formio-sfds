import React, { useRef } from 'react'
import { Form, useForm } from '../react/form'

export default {
  title: 'Select component',
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
    autocomplete: {
      name: 'Auto-complete',
      description: 'When checked, set "widget" to "choicesjs"',
      type: 'boolean'
    },
    translations: {
      name: 'Translations',
      table: {
        type: { summary: 'Record<string, Record<string, string>>' }
      }
    }
  }
}

const Template = ({ label, values, autocomplete, language, translations }) => (
  <Form
    components={[
      {
        key: 'component',
        label,
        type: 'select',
        widget: autocomplete ? 'choicesjs' : 'html5',
        tags: autocomplete ? ['autocomplete'] : [],
        data: {
          values
        }
      }
    ]}
    options={{
      language,
      i18n: translations
    }}
  />
)

const defaultValues = {
  label: 'Which way?',
  autocomplete: false,
  values: [
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' }
  ],
  translations: {
    es: {
      'component.label': '¿Qué dirección?',
      'component.values.up': 'Arriba',
      'component.values.down': 'Abajo'
    }
  }
}

export const BasicHTML = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'en',
      ...defaultValues
    }
  }
)

export const BasicAutocomplete = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'en',
      ...defaultValues,
      autocomplete: true
    }
  }
)

export const TranslatedHTML = Object.assign(
  Template.bind({}),
  {
    args: {
      language: 'es',
      ...defaultValues
    }
  }
)
