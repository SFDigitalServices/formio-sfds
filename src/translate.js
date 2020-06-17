import i18next from 'i18next'
import loadTranslations from './i18n/load'

const I18N_SERVICE_URL = 'https://i18n-microservice-js.herokuapp.com'

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

const loadingIndicator = document.getElementById('loading')

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
    const { values } = data
    if (dataSrc === 'values' && values) {
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
  // passing a distinct instance of i18next prevents this form from being
  // translated by strings in the form we're testing
  i18next: i18next.createInstance({ lng: 'en' }),
  language: 'en',
  components: [
    {
      type: 'htmlelement',
      content: 'If you don&rsquo;t know the values below, you can find them in the "Edit" view of your page on sf.gov.'
    },
    {
      key: 'formUrl',
      type: 'textfield',
      label: 'Data source',
      description: 'This is the "Data Source" field in the Drupal admin view of your form page.',
      placeholder: 'https://sfds.form.io/...',
      validate: {
        required: true
      }
    },
    {
      type: 'columns',
      columns: [
        {
          width: 5,
          components: [
            {
              key: 'sheetsUrl',
              type: 'textfield',
              label: 'Google Sheets URL',
              validate: {
                // required: true
              },
              customDefaultValue ({ data: { sheetId } }) {
                return sheetId ? getSpreadsheetUrl(sheetId) : ''
              },
              calculateValue ({ value, data: { sheetId } }) {
                const urlOrId = sheetId || value
                return urlOrId ? getSpreadsheetUrl(urlOrId) : ''
              }
            },
            {
              key: 'sheetId',
              type: 'textfield',
              hidden: true,
              calculateValue ({ data: { sheetId, sheetsUrl } }) {
                return sheetId || (sheetsUrl ? getSheetId(sheetsUrl) : '')
              }
            }
          ]
        },
        {
          width: 1,
          components: [
            {
              key: 'translationsVersion',
              type: 'textfield',
              label: 'Version'
            }
          ]
        }
      ],
      description: `
        Setting the version "freezes" the Google Sheet in the JSON service&rsquo;s cache.
        If you leave the "Version" field blank, data will be loaded from the Sheet each time (which is slow).
        Set this when you&rsquo;re ready to publish, then either update it (using <a href="https://semver.org">semver conventions</a>),
        or leave it blank to test changes in Google Sheets without "committing" to a new version.
      `.trim()
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
    },
    {
      type: 'fieldset',
      legend: 'Form settings',
      refreshOn: 'change',
      components: [
        {
          type: 'htmlelement',
          tag: 'div',
          content: 'These fields are calculated from the values provided above.'
        },
        {
          type: 'textfield',
          key: 'spreadsheetUrl',
          label: 'Google Sheets',
          disabled: true,
          customDefaultValue: calculatedSpreadsheetUrl,
          calculateValue: calculatedSpreadsheetUrl
        },
        {
          key: 'translationsUrl',
          type: 'textfield',
          label: 'Translations',
          disabled: true,
          customDefaultValue: calculatedTranslationsUrl,
          calculateValue: calculatedTranslationsUrl
        },
        {
          type: 'htmlelement',
          tag: 'div',
          content: 'Links: <a href="{{data.spreadsheetUrl}}">Spreadsheet</a>, <a href="{{data.translationsUrl}}">JSON</a>'
        },
        {
          key: 'renderOptions',
          type: 'textarea',
          label: 'Render options',
          description: 'Copy and paste this JSON into the "Form.io render options" field in Drupal to use these translations.',
          rows: 8,
          attributes: {
            style: 'resize: vertical;',
            disabled: true
          },
          calculateValue ({ data: { translationsUrl, translationsVersion } }) {
            return translationsUrl ? JSON.stringify({
              i18n: translationsUrl,
              googleTranslate: false
            }, null, 2) : '{}'
          }
        }
      ]
    }
  ]
}, {
  // options
  prefill: 'url'
}).then(editForm => {
  editForm.on('submit', async submission => {
    errorList.innerHTML = ''
    loadingIndicator.hidden = false

    console.info('submit:', submission)

    await editForm.redraw()

    const {
      formUrl,
      sheetId,
      translationsVersion,
      translationsUrl,
      lang
    } = submission.data

    const params = { formUrl, sheetId, translationsVersion, lang }
    if (window.location.hash) {
      console.info('replacing URL hash:', window.location.hash, params)
      window.location.hash = formatQueryString(params)
    } else {
      if (window.location.search) {
        console.info('replacing query string:', window.location.search, params)
      }
      window.history.replaceState(params, '', `?${formatQueryString(params)}`)
    }

    const element = document.getElementById('translation-form')
    // element.hidden = false
    element.setAttribute('lang', lang)

    if (!translationsUrl) {
      console.error('Translations URL was not set in:', submission.data)
      return
    }

    await loadTranslations(translationsUrl).then(translations => {
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
      } else {
        return Formio.createForm(element, formUrl, {
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
      }
    })

    loadingIndicator.hidden = true
  })

  if (window.location.search || window.location.hash) {
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

function getSheetId (urlOrId) {
  if (urlOrId.includes('/')) {
    const match = urlOrId.match(/\/d\/([^/]+)\/edit/)
    console.warn('match?', match, urlOrId)
    return match ? match[1] : urlOrId
  } else {
    return urlOrId
  }
}

function getTranslationUrl (sheetId, version) {
  return sheetId
    ? appendPath(`${I18N_SERVICE_URL}/google/${sheetId}`, version)
    : ''
}

function appendPath (path, ...parts) {
  return [path, ...parts].filter(Boolean).join('/')
}

function getSpreadsheetUrl (sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`
}

function calculatedSpreadsheetUrl ({ data: { sheetId } }) {
  return sheetId ? getSpreadsheetUrl(sheetId) : ''
}

function calculatedTranslationsUrl ({ data: { sheetId, translationsVersion } }) {
  return getTranslationUrl(sheetId, translationsVersion)
}

function formatQueryString (data) {
  return new URLSearchParams(data).toString()
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
}
