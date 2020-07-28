import i18next from 'i18next'
import formioFieldDisplay from 'formiojs/components/_classes/component/editForm/Component.edit.display'
import { getStrings, getCondition } from '../lib/i18n'
import Phrase from '../i18n/phrase'

const { Formio } = window

const languages = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  tl: 'Tagalog'
}

const formioFieldsByType = formioFieldDisplay.reduce((map, field) => {
  map[field.key] = field
  return map
}, {})

const errorList = document.getElementById('errors')
const formElement = document.getElementById('translation-form')

const loadingIndicator = document.getElementById('loading')

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
      hidden: true,
      type: 'radio',
      key: 'lang',
      label: 'Language',
      defaultValue: 'en',
      values: Array.from(Object.entries(languages), ([value, label]) => ({
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
  editForm.on('submit', async submission => {
    errorList.innerHTML = ''
    loadingIndicator.hidden = false

    console.info('submit:', submission)

    const {
      formUrl,
      lang
    } = submission.data

    const form = await Formio.createForm(formElement, formUrl, { language: lang })

    const { i18next } = form
    const strings = getStrings(form.form)
    const { phraseProjectId } = form.form.properties || {}

    if (!phraseProjectId) {
      Phrase.disable()
      window.alert('You need to set up your form.io project to use Phrase first')
      return
    } else {
      Phrase.enable({
        projectId: phraseProjectId
      })
    }

    const t = i18next.t.bind(i18next)

    i18next.t = keyOrKeys => {
      if (Array.isArray(keyOrKeys)) {
        return formatKey(keyOrKeys[0])
      } else {
        return formatKey(keyOrKeys)
      }
    }

    await form.redraw()

    window.showComponent = form.focusOnComponent.bind(form)

    for (const str of strings) {
      const { component, parents } = str
      const translated = t(str.value)
      if (translated === str.value && lang !== 'en') {
        const overrideKey = `${component.key}_${str.path}`
        const override = t(overrideKey)
        if (override && override !== overrideKey) {
          console.warn('Found override for "%s" in "%s": "%s"', str.value, overrideKey, override)
          continue
        }
        report({
          lang,
          string: str.value,
          value: '',
          message: 'Missing translation',
          component,
          loc: {
            href: `javascript:showComponent('${component.key}')`,
            text: `${linkToComponent(component, parents)} → <b>${fieldDescription(str.path)}</b>`
          }
        })
      }
    }
  })

  loadingIndicator.hidden = true

  if (window.location.search || window.location.hash) {
    editForm.submit()
  }
})

function report (error) {
  const { string, loc } = error
  const dt = document.createElement('dt')
  dt.className = 'm-0 p-0'
  dt.innerHTML = formatString(string)
  errorList.appendChild(dt)
  if (loc) {
    const dd = document.createElement('dd')
    dd.className = 'pl-2 mt-0 mb-2 ml-0'
    if (loc instanceof Object) {
      const { text, href } = loc
      dd.innerHTML = href ? `<a href="${href}">${text}</a>` : text
    } else {
      dd.innerHTML = loc || '???'
    }
    errorList.appendChild(dd)
  }
}

function formatKey (key) {
  return `{{__phrase_${key}__}}`
}

function linkToComponent (component, parents = []) {
  const cond = formatConditional(component)
  const typeSuffix = cond ? `, ${cond}` : ''
  const label = formatComponentLabel(component)
  const typeDesc = `${getComponentName(component.type)}${typeSuffix}`
  const text = label ? `${label} (${typeDesc})` : typeDesc
  if (parents.length > 0) {
    const [parent, ...rest] = parents
    return `${linkToComponent(parent, rest)} → ${text}`
  }
  return text
}

function fieldDescription (type) {
  const field = formioFieldsByType[type]
  if (!field) {
    // console.warn('no field def for "%s"', type, formioFieldsByType)
  }
  return (field && field.label) || type
}

function formatComponentLabel (component) {
  const { type } = component
  if (type === 'htmlelement' || type === 'textarea') {
    return ''
  } else {
    const label = component.title || component.label || component.key || component.type
    return label ? `${label}` : '<u>???</u>'
  }
}

function formatConditional (component) {
  const cond = getCondition(component)
  return cond
    ? `<u title="${JSON.stringify(cond, null, 2).replace(/"/g, '&quot;')}">conditional</u>`
    : ''
}

function getComponentName (type) {
  const { builderInfo = {} } = Formio.Components.components[type] || {}
  return builderInfo.title || type
}

function formatString (str) {
  // eslint-disable-next-line no-unused-vars
  const [_, leading, inner, trailing] = str.match(/^(\s*)(.+)(\s*)$/, str) || ['', '', str, '']
  return `<q>${formatGremlins(leading)}${escapeHTML(inner)}${formatGremlins(trailing)}</q>`
}

function escapeHTML (str) {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatGremlins (str) {
  return str ? `<pre class="d-inline-block bg-red">${str}</pre>` : ''
}
