import loadTranslations from './i18n/load'

const languages = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  tl: 'Tagalog'
}

const errorTable = document.getElementById('errors')
const errorList = errorTable.querySelector('tbody')

const columns = [
  ['string', s => `<code>${s}</code>`, 'String'],
  // ['value', s => `<code>${s}</code>`, 'Translation'],
  ['message', s => s, 'Message'],
  ['link', ({ title, href, path }) => `&ldquo;${title}&rdquo; (${path})`, 'Component']
]

const thead = errorTable.querySelector('thead').appendChild(document.createElement('tr'))
for (const [key, format, heading] of columns) { // eslint-disable-line no-unused-vars
  const th = document.createElement('th')
  th.className = 'align-left p-1'
  th.textContent = heading || key
  thead.appendChild(th)
}

const { Formio, FormioUtils } = window

const fields = [
  field('label'),
  field('description'),
  field('tooltip'),
  field('data', (data, component) => {
    const { dataSrc, template } = component
    if (dataSrc === 'values' && data.values) {
      const { values } = data
      const match = template.match(/{{\s*item\.(\w+)\s*}}/)
      const labelProperty = match ? match[0] : 'label'
      return values.map((value, index) => {
        return {
          value: value[labelProperty],
          path: `data.values[${index}].${labelProperty}`
        }
      })
    }
  })
]

Formio.createForm(document.getElementById('edit-form'), {
  components: [
    {
      type: 'htmlelement',
      content: 'If you don&rsquo;t know the values below, you can find them in the "Edit" view of your page on sf.gov.'
    },
    {
      type: 'textfield',
      key: 'formUrl',
      label: 'Data source',
      description: 'This is the "Data Source" field in the Drupal edit UI.',
      placeholder: 'https://sfds.form.io/...',
      validate: {
        required: true
      }
    },
    {
      type: 'textfield',
      key: 'translationsUrl',
      label: 'Translations URL',
      description: 'This is the "i18n" key from the JSON in the "Form.io Render Options" field.'
    },
    {
      type: 'radio',
      key: 'lang',
      label: 'Language',
      defaultValue: 'en',
      values: Array.from(Object.entries(languages)).map(([value, label]) => ({
        value,
        label
      }))
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
  prefill: 'url'
}).then(editForm => {
  editForm.on('submit', submission => {
    errorList.innerHTML = ''

    const {
      formUrl,
      translationsUrl,
      lang
    } = submission.data

    const element = document.getElementById('translation-form')
    // element.hidden = false
    element.setAttribute('lang', lang)

    loadTranslations(translationsUrl).then(async translations => {
      console.info('translations:', translations)

      if (!translations[lang]) {
        listError({
          lang,
          string: lang,
          value: undefined,
          link: {
            title: 'Translations',
            href: translationsUrl
          },
          message: `Missing "${lang}" language code column`
        })

        return
      }

      await Formio.createForm(element, formUrl, {
        i18n: translations,
        language: lang
      })
        .then(form => {
          FormioUtils.eachComponent(form.form.components, component => {
            const allStrings = fields.reduce((all, getStrings) => {
              const strings = getStrings(component).filter(data => data && data.value)
              return all.concat(strings)
            }, [])

            for (const { path, value } of allStrings) {
              const translated = form.i18next.t(value)
              if (translated === value && lang !== 'en') {
                listError({
                  lang,
                  string: value,
                  value: '',
                  message: 'Missing translation',
                  link: {
                    title: component.label || `Key: "${component.key}"`,
                    href: `#component-${component.key}`,
                    path
                  }
                })
              }
            }
          })

          form.detach()
        })
    })
  })

  if (window.location.search) {
    editForm.submit()
  }
})

function listError (data) {
  const row = document.createElement('tr')
  for (const [key, format] of columns) {
    const cell = document.createElement('td')
    cell.className = 'border-top-1 border-grey-1 p-1'
    cell.setAttribute('data-key', key)
    cell.innerHTML = data[key] ? format(data[key]) : ''
    row.appendChild(cell)
  }
  errorList.appendChild(row)
}

function field (key, get) {
  if (get) {
    return component => (key in component) ? get(component[key], component) || [] : []
  } else {
    return component => (key in component) ? [{ value: component[key], path: key }] : []
  }
}
