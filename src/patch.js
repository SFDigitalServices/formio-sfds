import defaultTranslations from './i18n'
import { observe } from 'selector-observer'
import { mergeObjects } from './utils'
import buildHooks from './hooks'
import loadTranslations from './i18n/load'
import 'flatpickr/dist/l10n/es'
// import 'flatpickr/dist/l10n/tl'
import 'flatpickr/dist/l10n/zh-tw'

const WRAPPER_CLASS = 'formio-sfds'
const PATCHED = `sfds-patch-${Date.now()}`

let util
const forms = []

export default Formio => {
  if (Formio[PATCHED]) {
    return
  }

  const { FormioUtils } = window
  util = FormioUtils

  patch(Formio)
  patchDateTimeSuffix()

  Formio[PATCHED] = true
}

function patch (Formio) {
  console.info('Patching Formio.createForm() with SFDS behaviors...')

  hook(Formio, 'createForm', async (createForm, args) => {
    const [el, resourceOrOptions, options = resourceOrOptions || {}] = args
    // get the default language from the element's (inherited) lang property
    const language = el.lang || document.documentElement.lang
    // use the translations and language as the base, and merge the provided options
    const opts = mergeObjects({ i18n: defaultTranslations, language }, options)

    if (typeof opts.i18n === 'string') {
      const { i18n: translationsURL } = opts
      console.info('loading translations form:', translationsURL)
      try {
        const i18n = await loadTranslations(translationsURL)
        console.info('loaded translations:', i18n)
        opts.i18n = mergeObjects({}, opts.i18n, i18n)
      } catch (error) {
        console.warn('Unable to load translations from:', translationsURL, error)
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

    const rest = resourceOrOptions ? [resourceOrOptions, opts] : [opts]
    return createForm(el, ...rest).then(form => {
      if (opts.formioSFDSOptOut === true) {
        console.log('SFDS form opted out:', opts, el)
        return form
      }

      console.log('SFDS form created!')

      const { element } = form

      element.classList.add('d-flex', 'flex-column-reverse', 'mb-4')
      if (opts.googleTranslate === false) {
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

      // Note: we create a shallow copy of the form model so the .form setter
      // will treat it as changed. (form.io showed us this trick!)
      const model = { ...form.form }
      patchSelectMode(model)
      form.form = model

      for (const [event, handler] of Object.entries(eventHandlers)) {
        form.on(event, handler)
      }

      if (opts.data) {
        form.submission = { data: opts.data }
      }

      if (opts.prefill) {
        console.info('submission before prefill:', form.submission)
        let params
        switch (opts.prefill) {
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
              console.warn('Unrecognized prefill option value: "%s"', opts.prefill)
            }
        }
        if (params) {
          const data = {}
          for (const [key, value] of params.entries()) {
            if (key in form.submission.data) {
              data[key] = value
            } else {
              console.warn('ignoring querystring key "%s": "%s"', key, value)
            }
          }
          console.info('prefill submission data:', data)
          form.submission = { data }
        }
      }

      updateLanguage(form)
      forms.push(form)

      return form
    })
  })

  patchI18nMultipleKeys(Formio)

  patchDateTimeLocale(Formio)

  // this goes last so that if it fails it doesn't break everything else
  patchLanguageObserver()
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

function patchI18nMultipleKeys (Formio) {
  /*
   * Patch the base Component class's t() method to support multiple key
   * fallbacks as the first argument. As of 4.10.0-beta.3.1, form.io's
   * implementation treats the first argument as a string even if it's an Array,
   * which means that in a template, this call:
   *
   * ```js
   * ctx.t(['some.nonexistent.key', ''])
   * ```
   *
   * Will render the string "some.nonexistent.key,". The trailing comma is from
   * the array being coerced to a string in the last line here:
   *
   * <https://github.com/formio/formio.js/blob/58996eac1207803cb597b4ab7c3abc6636078c72/src/components/_classes/component/Component.js#L707-L708>
   */
  hook(Formio.Components._components.component.prototype, 't', function (t, [keys, params]) {
    if (Array.isArray(keys)) {
      const last = keys.length - 1
      const fallback = (key, index) => {
        const value = t(key, params)
        return value === key ? (index === last) ? value : '' : value
      }
      return keys.reduce((value, key, index) => {
        return value || fallback(key, index)
      }, '')
    } else {
      return t(keys, params)
    }
  })
}

function patchDateTimeSuffix () {
  observe('.formio-component-datetime', {
    add (el) {
      const group = el.querySelector('.input-group')
      if (!group) return
      const text = group.querySelector('.input-group-append')
      if (text) {
        text.classList.remove('input-group-append')
        text.classList.add('input-group-prepend')
        group.insertBefore(text, group.firstChild)
      }
    }
  })
}

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

function getFlatpickrLocale (lang) {
  return {
    // XXX This is a fix for the mapping of Drupal language codes to Google Translate's here:
    // <https://github.com/SFDigitalServices/sfgov/blob/2b52656f27be3aa392b5161937c6c81b79861fa6/web/themes/custom/sfgovpl/includes/html.inc#L119>
    // The problem we're solving here is that flatpickr doesn't recognize "zh-hant".
    'zh-hant': 'zh-tw'
  }[lang.toLowerCase()] || lang.split('-')[0]
}
