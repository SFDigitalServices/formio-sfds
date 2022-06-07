const { PREVIEW_BASE_URL = 'https://formio-sfds.herokuapp.com' } = process.env
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = `${PREVIEW_BASE_URL}/sfgov/forms.css`
document.head.appendChild(link)

export const parameters = {
  actions: {
    argTypesRegex: '^on[A-Z]',
    handles: ['change']
  },
  controls: {
  }
}

/** @type {import('@storybook/addons').ArgTypes} */
export const argTypes = {
  language: {
    name: 'Language',
    options: ['en', 'es', 'zh', 'fil'],
    description: 'Render the form in this language',
    type: 'select',
    control: {
      labels: {
        en: 'English',
        es: 'Spanish',
        zh: 'Chinese',
        fil: 'Filipino'
      }
    },
    table: {
      defaultValue: {
        summary: 'English'
      }
    }
  }
}
