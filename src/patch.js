import { observe } from 'selector-observer'
import defaultTranslations from './i18n'
import buildHooks from './hooks'
import loadTranslations from './i18n/load'
import Phrase from './phrase'
import { mergeObjects } from './utils'
import 'flatpickr/dist/l10n/es'
// import 'flatpickr/dist/l10n/tl'
// import 'flatpickr/dist/l10n/zh'
import 'flatpickr/dist/l10n/zh-tw'

const WRAPPER_CLASS = 'formio-sfds'
const PATCHED = `sfds-patch-${Date.now()}`

const debugDefault = process.env.NODE_ENV !== 'test'

const defaultEvalContext = {
  inputId () {
    const parts = [
      'input',
      this.component.row,
      this.id || this.input?.attr?.name
    ].filter(Boolean)
    return parts.join('-')
  },

  tk (field, defaultValue = '') {
    const { component = {} } = this
    const { type, key = type } = component
    return key ? this.t([
      `${key}.${field}`,
      `${key}_${field}`,
      component[field] || defaultValue || ''
    ]) : defaultValue
  },

  requiredAttributes () {
    return this.component?.validate?.required ? 'required' : ''
  }
}

let util
const forms = []

export default Formio => {
  if (Formio[PATCHED]) {
    return
  }

  const { FormioUtils } = window
  util = FormioUtils

  patch(Formio)
  Formio[PATCHED] = true

  patchDateTimeSuffix()
  patchDayLabels()
  patchDateTimeLabels()
  patchDateTimeLocale(Formio)

  // this goes last so that if it fails it doesn't break everything else
  patchLanguageObserver()

  // toggles
  toggleComponent()
}

// Prevent users from navigating away and losing their entries.
let warnBeforeLeaving = false

window.addEventListener('beforeunload', (event) => {
  if (warnBeforeLeaving) {
    // Most browsers will show a default message instead of this one.
    event.returnValue = 'Leave site? Changes you made may not be saved.'
  }
})

function patch (Formio) {
  if (debugDefault) console.info('Patching Formio.createForm() with SFDS behaviors...')

  hook(Formio, 'createForm', async (createForm, args) => {
    const [el, resourceOrOptions, options = resourceOrOptions || {}] = args
    const { debug = debugDefault } = options

    // get the default language from the element's (inherited) lang property
    const language = el.lang || document.documentElement.lang || 'en'
    // use the translations and language as the base, and merge the provided options
    const opts = mergeObjects({ i18n: defaultTranslations, language }, options)

    if (typeof opts.i18n === 'string') {
      const { i18n: translationsURL } = opts
      if (debug) console.info('loading translations form:', translationsURL)
      try {
        const i18n = await loadTranslations(translationsURL)
        if (debug) console.info('loaded translations:', i18n)
        opts.i18n = mergeObjects({}, opts.i18n, i18n)
      } catch (error) {
        if (debug) console.warn('Unable to load translations from:', translationsURL, error)
        // FIXME: we may want to explicitly *allow* Google Translate (even if
        // it's been disabled) for this form if translations fail to load.
        // opts.googleTranslate = true
      }
    }

    if (opts.hooks instanceof Object) {
      opts.hooks = buildHooks(opts.hooks)
    }

    let eventHandlers = {}
    if (opts.on instanceof Object) {
      eventHandlers = buildHooks(opts.on)
    }

    opts.evalContext = Object.assign({}, defaultEvalContext, opts.evalContext)

    const rest = resourceOrOptions ? [resourceOrOptions, opts] : [opts]
    return createForm(el, ...rest).then(async form => {
      if (opts.formioSFDSOptOut === true) {
        if (debug) console.info('SFDS form opted out:', opts, el)
        return form
      }

      if (debug) {
        // console.log('SFDS form created!')
      }

      const phrase = new Phrase(form)
      form.phrase = phrase

      let { googleTranslate } = opts

      const { element } = form
      element.classList.add('d-flex', 'flex-column-reverse', 'mb-4')

      if (googleTranslate === false) {
        disableGoogleTranslate(element)
      }

      let wrapper = element.closest(`.${WRAPPER_CLASS}`)
      if (!wrapper) {
        // only create a wrapper if it's not already wrapped
        wrapper = document.createElement('div')
        wrapper.className = WRAPPER_CLASS
        element.parentNode.insertBefore(wrapper, element)
        wrapper.appendChild(element)
      }

      try {
        const loaded = await phrase.load(loadTranslations)
        if (loaded) {
          googleTranslate = false

          if (loaded.projectId && userIsTranslating(opts)) {
            phrase.enableEditor()
          } else if (debug) {
            console.warn('loaded Phrase translations, but not the in-context editor', loaded, window.drupalSettings, window.location.search)
          }
        }
      } catch (error) {
        if (debug) console.warn('Failed to load translations:', error)
      }

      // Note: we create a shallow copy of the form model so the .form setter
      // will treat it as changed. (form.io showed us this trick!)
      const model = { ...form.form }
      if (opts.disableConditionals) {
        disableConditionals(model.components)
      }
      patchSelectMode(model)
      form.form = model

      for (const [event, handler] of Object.entries(eventHandlers)) {
        form.on(event, handler)
      }

      if (opts.data) {
        form.submission = { data: opts.data }
      }

      if (opts.scroll !== false) {
        form.on('nextPage', scrollToTop)
        form.on('prevPage', scrollToTop)
        form.on('prevPage', () => { doToggle(element) })
        form.on('nextPage', () => { 
          warnBeforeLeaving = true
          doToggle(element)
        })
        form.on('wizardNavigationClicked', () => { 
          doToggle(element, true)
        })
        form.on('submit', () => { warnBeforeLeaving = false })
      }

      if (opts.prefill) {
        if (debug) console.info('submission before prefill:', form.submission)
        let params
        switch (opts.prefill) {
          case 'url':
            params = new URLSearchParams(window.location.search || window.location.hash.substr(1))
            break
          case 'querystring':
            params = new URLSearchParams(window.location.search)
            break
          case 'hash':
            params = new URLSearchParams(window.location.hash.substr(1))
            break
          default:
            if (opts.prefill instanceof URLSearchParams) {
              params = opts.prefill
            } else {
              if (debug) console.warn('Unrecognized prefill option value: "%s"', opts.prefill)
            }
        }
        if (params) {
          const data = {}
          for (const [key, value] of params.entries()) {
            if (key in form.submission.data) {
              data[key] = value
            } else {
              if (debug) console.warn('ignoring querystring key "%s": "%s"', key, value)
            }
          }
          if (debug) console.info('prefill submission data:', data)
          form.submission = { data }
        }
      }

      updateLanguage(form)
      forms.push(form)

      return form
    })
  })
}

function patchSelectMode (model) {
  const selects = util.searchComponents(model.components, { type: 'select' })
  for (const component of selects) {
    if (component.tags && component.tags.includes('autocomplete')) {
      component.customOptions = Object.assign({
        shouldSort: true
      }, component.customOptions)
    } else {
      component.widget = 'html5'
    }
  }
}

function patchLanguageObserver () {
  const observer = new window.MutationObserver(mutations => {
    for (const form of forms) {
      updateLanguage(form)
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
    subtree: true
  })

  return observer
}

function updateLanguage (form) {
  const closestLangElement = form.element.closest('[lang]:not([class*=sfgov-translate-lang-])')
  if (closestLangElement) {
    form.language = closestLangElement.getAttribute('lang')
  }
}

function hook (obj, methodName, wrapper) {
  const method = obj[methodName]
  obj[methodName] = function (...args) {
    return wrapper.call(this, method.bind(this), args)
  }
}

function patchDateTimeSuffix () {
  observe('.formio-component-datetime .input-group', {
    add (el) {
      const text = el.querySelector('.input-group-append')
      if (text) {
        text.classList.remove('input-group-append')
        text.classList.add('input-group-prepend')
        el.insertBefore(text, el.firstChild)
      }
    }
  })
}

function patchDayLabels () {
  observe('.formio-component-day[id]', {
    add (el) {
      const { id } = el
      const prefix = `input-${id}`
      const inputs = el.querySelectorAll(`[id="${prefix}"]`)
      const labels = el.querySelectorAll(`label:not([for="${prefix}"])`)

      for (const [index, input] of Object.entries(inputs)) {
        const ref = input.getAttribute('ref')
        input.id = `${prefix}-${ref}`
        const label = labels[index]
        label.setAttribute('for', input.id)
      }
    }
  })
}

function patchDateTimeLabels () {
  observe('.formio-component-datetime[id]', {
    add (el) {
      const { id } = el
      const labelId = `label-${id}`
      const label = el.querySelector(`label[for="input-${id}"]`)
      if (label) {
        label.setAttribute('id', labelId)
      }
      const input = el.querySelector('input.form-control[type=text]')
      if (input) {
        input.setAttribute('aria-labelledby', labelId)
      }
    }
  })
}

/**
 * This patch can go away as soon as we upgrade to formiojs's (eventual)
 * release of 4.12.0, which should include this fix:
 *
 * <https://github.com/formio/formio.js/pull/3129>
 */
function patchDateTimeLocale (Formio) {
  hook(Formio.Components.components.datetime.prototype, 'attach', function (attach, args) {
    if (this.options.language) {
      this.component.widget.locale = getFlatpickrLocale(this.options.language)
    }
    return attach(...args)
  })

  observe('.flatpickr-calendar', {
    add: disableGoogleTranslate
  })
}

function disableGoogleTranslate (el) {
  // Google Translate
  el.classList.add('notranslate')
  // Microsoft, Google, et al; see:
  // <https://www.w3.org/International/questions/qa-translate-flag.en>
  el.setAttribute('translate', 'no')
}

function getFlatpickrLocale (code) {
  if (code in window.flatpickr.l10ns) {
    return code
  }
  // get the language portion of the code, e.g. "zh" from "zh-TW"
  const lang = code.split('-')[0]
  return {
    // Prefer traditional (Taiwan) to simplified (China)
    zh: 'zh_tw'
  }[lang] || lang
}

function scrollToTop () {
  window.scroll(0, 0)
}

function disableConditionals (components) {
  util.eachComponent(components, comp => {
    comp.properties.conditional = comp.conditional
    comp.conditional = {}
  })
}

function userIsTranslating (opts) {
  if (opts?.translate === true) {
    return true
  }
  const uid = window.drupalSettings?.user?.uid
  if (uid && uid !== '0') {
    const translate = new URLSearchParams(window.location.search).get('translate')
    return translate === 'true'
  }
}

function toggleComponent() {
  observe('[data-toggle-container]', {
    add(el) {
      const ariaControl = el.querySelector('[aria-controls]')

      ariaControl.addEventListener('click', (event) => {        
        if (ariaControl.hasAttribute('aria-expanded')) {
          const expanded = ariaControl.getAttribute('aria-expanded')
          expanded === 'true' ? doToggle(el) : doToggle(el, true)
        }
      })
    }
  })
}

function doToggle(element, show = false) {
  const toggler = element.hasAttribute('data-toggle-container') ? element : element.querySelector('[data-toggle-container]')
  if (toggler) {
    const ariaControl = toggler.querySelector('[aria-controls]')
    const content = document.getElementById(ariaControl.getAttribute('aria-controls'));
    if (show) {
      ariaControl.setAttribute('aria-expanded', 'true')
      content.style.display = 'block'
    } else {
      ariaControl.setAttribute('aria-expanded', 'false')
      content.style.display = 'none'
    }
  }
}
