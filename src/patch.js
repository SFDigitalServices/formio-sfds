import dot from 'dotmap'
import { observe } from 'selector-observer'
import defaultTranslations from './i18n'
import buildHooks from './hooks'
import { loadTranslations, loadEmbeddedTranslations } from './i18n/load'
import Phrase from './phrase'
import { mergeObjects } from './utils'
import flatpickrLocales from './i18n/flatpickr'

const WRAPPER_CLASS = 'formio-sfds'
const PATCHED = `sfds-patch-${Date.now()}`

const hasProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

const debugDefault = process.env.NODE_ENV !== 'production'

const libraryHooks = {}

const defaultEvalContext = {
  inputId () {
    const parts = [
      'input',
      this.component.row,
      this.id || this.input?.attr?.name
    ].filter(Boolean)
    return parts.join('-')
  },

  classnames: require('classnames'),

  tk (field, defaultValue = '') {
    const { component = {} } = this
    const { type, key = type } = component
    return key ? this.t([
      `${key}.${field}`,
      // this is the "legacy" naming scheme
      `${key}_${field}`,
      `component.${type}.${field}`,
      dot.get(component, field) || defaultValue || ''
    ]) : defaultValue
  },

  requiredAttributes () {
    return this.component?.validate?.required
      ? 'required aria-required="true"'
      : ''
  }
}

const { FormioUtils } = window

export const forms = []

export default Formio => {
  if (Formio[PATCHED]) {
    return
  }

  patch(Formio)
  Formio[PATCHED] = true

  patchFormioLibraries(Formio)

  patchDateTimeSuffix()
  patchDayLabels()
  patchDateTimeLabels()
  patchAriaInvalid(Formio)
  patchFlatpickrLocales()

  // this goes last so that if it fails it doesn't break everything else
  patchLanguageObserver()

  // toggles
  toggleComponent()
}

// Prevent users from navigating away and losing their entries.
let warnBeforeLeaving = false

window.addEventListener('beforeunload', event => {
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

      patchSelectWidget(model, form)

      loadEmbeddedTranslations(model, form.i18next)

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

      forms.push(form)

      await form.redraw()

      return form
    })
  })
}

function patchSelectWidget (model, form) {
  const selects = FormioUtils.searchComponents(model.components, { type: 'select' })

  // forEach() instead of for...of gives us a closure,
  // which is important because the component reference needs to
  // persist for functions like searchPlaceholderValue()
  selects.forEach(component => {
    const compKey = component.key
    if (component.tags && component.tags.includes('autocomplete')) {
      const t = (prop, ...rest) => {
        const key = `autocomplete.${prop}`
        const fallback = dot.get(defaultTranslations.en, key) || ''
        return form.t([
          `${compKey}.${key}`,
          key,
          fallback
        ], ...rest)
      }

      component.customOptions = Object.assign({
        // shown when no results match the search input
        noResultsText: t('noResultsText'),
        // shown when no options are available (or loaded from an API)
        noChoicesText: t('noChoicesText'),
        // this overrides addItemText if provided
        itemSelectText: t('itemSelectText'),
        searchPlaceholderValue: t('searchPlaceholderValue'),
        addItemText: component.customOptions?.addItemText ? value => {
          return t('addItemText', {
            value: FormioUtils.sanitize(value, {
              sanitizeConfig: component.customOptions?.sanitize
            })
          })
        } : false,
        maxItemText (count) {
          return t('maxItemText', { count })
        }
      }, component.customOptions)
    } else {
      component.widget = 'html5'
    }
  })
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

async function updateLanguage (form) {
  const closestLangElement = form.element.closest('[lang]:not([class*=sfgov-translate-lang-])')
  if (closestLangElement) {
    const lang = closestLangElement.getAttribute('lang')
    const currentLang = form.language || form.i18next.language
    if (currentLang === lang) {
      await form.redraw()
      return lang
    } else {
      await (form.language = lang)
      return lang
    }
  }
}

function hook (obj, methodName, wrapper) {
  const method = obj[methodName]
  obj[methodName] = function (...args) {
    return wrapper.call(this, method.bind(this), args)
  }
}

function hookLibrary (name, hook) {
  if (hasProperty(window, name)) {
    hook(window[name], name)
  } else {
    libraryHooks[name] = hook
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

function patchAriaInvalid (Formio) {
  hook(Formio.Components.components.component.prototype, 'setErrorClasses', function (setErrorClasses, [elements, ...rest]) {
    setErrorClasses(elements, ...rest)
    for (const el of elements) {
      const input = this.performInputMapping(el)
      const invalid = input.classList.contains('is-invalid')
      input.setAttribute('aria-invalid', invalid)
    }
  })
}

function patchFormioLibraries (Formio) {
  if (typeof Formio.requireLibrary === 'function') {
    hook(Formio, 'requireLibrary', async (requireLibrary, [name, ...args]) => {
      if (typeof libraryHooks[name] === 'function') {
        const lib = await requireLibrary(name, ...args)
        await libraryHooks[name].call(null, lib, name)
        return lib
      }
      return requireLibrary(name, ...args)
    })
  } else {
    setInterval(() => {
      for (const name in libraryHooks) {
        if (hasProperty(window, name)) {
          libraryHooks[name].call(null, window[name], name)
          delete libraryHooks[name]
        }
      }
    }, 50)
  }
}

/**
 * This patch originally accounted for a bug in formio.js, which was fixed
 * in 4.12.0:
 *
 * <https://github.com/formio/formio.js/pull/3129>
 *
 * However, now that flatpickr is loaded only as needed by formio.js,
 * we can't just import the translations at the top of this file and expect
 * them to be applied. The new fix is to hook into Formio.requireLibrary()
 * and patch flatpickr when it's loaded, then add the translations to the
 * library before it's used to render datetime components.
 */
function patchFlatpickrLocales () {
  hookLibrary('flatpickr', async flatpickr => {
    for (const code in flatpickrLocales) {
      flatpickr.l10ns[code] = flatpickrLocales[code]
    }
    observe('.flatpickr-calendar', {
      add: disableGoogleTranslate
    })
  })
}

function disableGoogleTranslate (el) {
  // Google Translate
  el.classList.add('notranslate')
  // Microsoft, Google, et al; see:
  // <https://www.w3.org/International/questions/qa-translate-flag.en>
  el.setAttribute('translate', 'no')
}

function scrollToTop () {
  window.scroll(0, 0)
}

function disableConditionals (components) {
  FormioUtils.eachComponent(components, comp => {
    comp.properties.conditional = comp.conditional
    comp.conditional = {}
  }, true)
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

function toggleComponent () {
  observe('[data-toggle-container]', {
    add (el) {
      const ariaControl = el.querySelector('[aria-controls]')

      ariaControl.addEventListener('click', event => {
        if (ariaControl.hasAttribute('aria-expanded')) {
          const expanded = ariaControl.getAttribute('aria-expanded')
          doToggle(el, expanded !== 'true')
        }
      })
    }
  })
}

function doToggle (element, show = false) {
  const toggler = element.hasAttribute('data-toggle-container')
    ? element
    : element.querySelector('[data-toggle-container]')
  if (toggler) {
    const ariaControl = toggler.querySelector('[aria-controls]')
    if (!ariaControl) return false

    const content = document.getElementById(ariaControl.getAttribute('aria-controls'))
    if (!content) return false
    if (show) {
      ariaControl.setAttribute('aria-expanded', 'true')
      content.hidden = false
    } else {
      ariaControl.setAttribute('aria-expanded', 'false')
      content.hidden = true
    }
  }
}
