import i18next from 'i18next'
import loadTranslations from './i18n/load'
import formioFieldDisplay from 'formiojs/components/_classes/component/editForm/Component.edit.display'

const I18N_SERVICE_URL = 'https://i18n-microservice-js.herokuapp.com'

const formioFieldsByType = formioFieldDisplay.reduce((map, field) => {
  map[field.key] = field
  return map
}, {})

const languages = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  tl: 'Tagalog'
}

const falseNegatives = {
  es: {
    No: true
  }
}

const errorTable = document.getElementById('errors')
const errorList = errorTable.querySelector('tbody')

const columns = [
  ['String', d => formatString(d.string), 'String'],
  // ['Message', d => d.message],
  ['Location', ({ loc }) => {
    if (loc instanceof Object) {
      const { text, href } = loc
      return href ? `<a href="${href}">${text}</a>` : text
    } else {
      return loc
    }
  }]
]

const loadingIndicator = document.getElementById('loading')

const thead = errorTable.querySelector('thead').appendChild(document.createElement('tr'))
for (const [heading, format] of columns) { // eslint-disable-line no-unused-vars
  const th = document.createElement('th')
  th.className = 'align-left p-1'
  th.textContent = heading
  thead.appendChild(th)
}

const { Formio } = window

const fields = [
  field('label', (label, component) => {
    if (component.type === 'panel') {
      return [{ value: component.title, path: 'title' }]
    } else if (label && !component.hideLabel) {
      return [{ value: component.label, path: 'label' }]
    }
  }),
  field('description'),
  field('content'),
  field('suffix'),
  field('values', (values, component) => fieldValues(values, 'values', 'label')),
  field('data', (data, component) => {
    const { dataSrc, template } = component
    const { values } = data
    if (dataSrc === 'values' && values) {
      const match = template.match(/{{\s*item\.(\w+)\s*}}/)
      const labelProperty = match ? match[0] : 'label'
      return fieldValues(values, 'data.values', labelProperty)
    }
  }),
  field('validate', ({ customMessage, custom }, component) => {
    const strings = []
    if (customMessage) {
      strings.push({ value: customMessage, path: 'validate.customMessage' })
    }
    if (custom) {
      const possibleStrings = custom.match(/"([^"]+)"/g) || []
      for (const possibleString in possibleStrings) {
        if (possibleString && !/^\d+$/.test(possibleString)) {
          strings.push({ value: possibleString, path: 'validate.custom (string)' })
        }
      }
    }
    return strings
  }),
  field('customError', (customError, component) => {
    return customError ? [{ value: customError, path: 'customError' }] : []
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
      spreadsheetUrl,
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
    element.setAttribute('lang', lang)

    if (!translationsUrl) {
      console.error('Translations URL was not set in:', submission.data)
      return
    }

    await loadTranslations(translationsUrl).then(translations => {
      document.getElementById('translation-data').value = JSON.stringify(translations, null, 2)

      if (!translations[lang]) {
        report({
          lang,
          string: lang,
          message: `Missing "${lang}" language code column`,
          loc: {
            title: 'Translations',
            href: spreadsheetUrl
          }
        })
      } else {
        return Formio.createForm(element, formUrl, {
          i18n: translations,
          language: lang
        })
          .then(form => {
            eachComponent(form.form.components, (component, index, parents) => {
              // console.log('component:', component, parents)

              const allStrings = fields.reduce((all, getStrings) => {
                const strings = getStrings(component).filter(data => data && data.value)
                return all.concat(strings)
              }, [])

              for (const str of allStrings) {
                const translated = translations[lang][str.value] || form.t(str.value)
                if (translated === str.value && lang !== 'en') {
                  const overrideKey = `${component.key}_${str.path}`
                  const override = form.i18next.t(overrideKey)
                  if (override && override !== overrideKey) {
                    console.warn('Found override for "%s" in "%s": "%s"', str.value, overrideKey, override)
                    continue
                  }
                  if (falseNegatives[lang] && falseNegatives[lang][str.value] === true) {
                    console.warn(`Possible false negative: "${str.value}" in English is the same in ${languages[lang]}`)
                    continue
                  }
                  report({
                    lang,
                    string: str.value,
                    value: '',
                    message: 'Missing translation',
                    loc: `${linkToComponent(component, parents)} → <b>${fieldDescription(str.path)}</b>`
                  })
                }
              }
            })
          })
      }
    })

    loadingIndicator.hidden = true
  })

  if (window.location.search || window.location.hash) {
    editForm.submit()
  }
})

function report (error) {
  const row = document.createElement('tr')
  for (const [title, format] of columns) {
    const cell = document.createElement('td')
    cell.className = 'border-top-1 border-grey-1 p-1'
    cell.setAttribute('data-key', title)
    cell.innerHTML = format(error)
    row.appendChild(cell)
  }
  errorList.appendChild(row)
}

function field (path, get) {
  if (get) {
    return component => (path in component) ? get(component[path], component) || [] : []
  } else {
    return component => (path in component) ? [{ value: component[path], path }] : []
  }
}

function fieldValues (values, path, property) {
  return values.map((value, index) => ({
    value: value[property],
    path: `${path}[${index}].${property}`
  }))
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

function calculatedSpreadsheetUrl ({ data: { sheetsUrl, sheetId } }) {
  return sheetsUrl || (sheetId ? getSpreadsheetUrl(sheetId) : '')
}

function calculatedTranslationsUrl ({ data: { sheetId, translationsVersion } }) {
  return getTranslationUrl(sheetId, translationsVersion)
}

function formatQueryString (data) {
  return new URLSearchParams(data).toString()
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
}

function eachComponent (components, iter, parents = []) {
  for (const [index, component] of Object.entries(components)) {
    const next = iter(component, index, parents || [])
    if (next === true) return component
    else if (next === false) return
    let children = component.components
    if (!children && component.columns) {
      children = component.columns.reduce((list, column) => list.concat(column.components), [])
    }
    if (children && children.length) {
      eachComponent(children, iter, parents.concat(component))
    }
  }
}

function linkToComponent (component, parents = []) {
  const cond = formatConditional(component)
  const typeSuffix = cond ? `, ${cond}` : ''
  const label = formatComponentLabel(component)
  const typeDesc = `${getComponentName(component.type)}${typeSuffix}`
  const text = label ? `${label} (${typeDesc})` : typeDesc
  if (parents.length > 0) {
    const [parent, ...rest] = parents
    return `${linkToComponent(parent, rest)} →<br>${text}`
  }
  return text
}

function formatComponentLabel (component) {
  const { type } = component
  if (type === 'htmlelement' || type === 'textarea') {
    return ''
  } else {
    const label = component.title || component.label || component.key || component.type
    return label ? `"${label}"` : '<u>???</u>'
  }
}

function formatConditional (component) {
  const { customConditional, conditional } = component
  const cond = customConditional || (conditional && conditional.show ? conditional : null)
  return cond
    ? `<u title="${JSON.stringify(cond, null, 2).replace(/"/g, '&quot;')}">conditional</u>`
    : ''
}

function getComponentName (type) {
  const { builderInfo = {} } = Formio.Components.components[type] || {}
  return builderInfo.title || type
}

function fieldDescription (type) {
  const field = formioFieldsByType[type]
  if (!field) {
    // console.warn('no field def for "%s"', type, formioFieldsByType)
  }
  return (field && field.label) || type
}

function formatString (str) {
  // eslint-disable-next-line no-unused-vars
  const [_, leading, inner, trailing] = str.match(/^(\s*)(.+)(\s*)$/, str)
  return `&ldquo;${formatGremlins(leading)}${escapeHTML(inner)}${formatGremlins(trailing)}&rdquo;`
}

function escapeHTML (str) {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatGremlins (str) {
  return str ? `<pre class="d-inline-block bg-red">${str}</pre>` : ''
}
