let translationForm

const { Formio } = window

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
    // element.hidden = false
    element.setAttribute('lang', lang)

    Formio.createForm(element, formUrl, {
      i18n: translationsUrl,
      language: lang
    }).then(form => {
      Object.assign(form.options.i18next.options, {
        saveMissing: true,
        missingKeyHandler (lng, ns, key, fallback, updateMissing, options) {
          console.error('Missing key: "%s"', key, options)
        },
        missingInterpolationHandler (text, value, options) {
          console.error('Missing interpolation: "%s"', text, value, options)
        }
      })

      console.log('form created with options:', form.options)
      translationForm = form

      form.redraw()
    })
  })

  if (window.location.search) {
    editForm.submit()
  }
})
