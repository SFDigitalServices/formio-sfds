import i18next from 'i18next'
import getJSON from './utils'

let translationForm

const { Formio } = window

window.i18next = i18next

Formio.createForm(document.getElementById('edit-form'), {
  components: [
    {
      type: 'textfield',
      key: 'formUrl',
      label: 'form.io resource or form',
      placeholder: 'https://sfds.form.io/...',
      validate: {
        required: true
      }
    },
    {
      type: 'textfield',
      key: 'translationsUrl',
      label: 'Translations URL',
      description: 'A Google Sheets URL, sheet ID, or i18n-microservice JSON URL'
    },
    {
      type: 'radio',
      key: 'lang',
      label: 'Language',
      defaultValue: 'en',
      values: [
        {
          label: 'English',
          value: 'en'
        },
        {
          label: 'Spanish',
          value: 'es'
        },
        {
          label: 'Chinese',
          value: 'zh'
        }
      ]
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Translate',
      hideLabel: true
    }
  ]
}, {
  // options
  prefill: 'querystring'
}).then(editForm => {
  editForm.on('submit', submission => {
    console.log('submit:', submission.data)

    if (translationForm) {
      translationForm.detach()
    }

    const {
      formUrl,
      translationsUrl,
      lang
    } = submission.data

    const element = document.getElementById('translation-form')
    element.hidden = false
    element.setAttribute('lang', lang)

    getJSON(translationsUrl).then(translations => {
      console.info('loaded translations:', translations)

      i18next.init({
        debug: true,
        lng: lang,
        resources: translations,
        missingKeyHandler (...args) {
          console.error('Missing key:', args)
        },
        missingInterpolationHandler (...args) {
          console.error('Missing interpolation:', args)
        }
      })
        .then(() => {
          console.log('i18next initialized:', i18next)
          i18next.initialized = true

          console.log('Hello, world!', i18next.t('Hello, world!'))

          Formio.createForm(element, formUrl, {
            i18next,
            i18nReady: true,
            language: lang
          }).then(form => {
            console.log('form created with options:', form.options)
            translationForm = form
          })
        })
    })
  })

  if (window.location.search) {
    editForm.submit()
  }
})
