import i18n from './i18n'
import buildHooks from './hooks'

const WRAPPER_CLASS = 'formio-sfds'
const PATCHED = `sfds-patch-${Date.now()}`

let util
const forms = []

export default Formio => {
  if (Formio[PATCHED]) {
    return
  }

  util = window.FormioUtils
  patch(Formio)

  Formio[PATCHED] = true
}

function patch (Formio) {
  console.info('Patching Formio.createForm() with SFDS behaviors...')

  hook(Formio, 'createForm', (createForm, [el, resource, options = {}]) => {
    // get the default language from the element's (inherited) lang property
    const language = el.lang || document.documentElement.lang
    // use the translations and language as the base, and merge the provided options
    const opts = mergeObjects({ i18n, language }, options)

    if (opts.hooks instanceof Object) {
      opts.hooks = buildHooks(opts.hooks)
    }

    let eventHandlers = {}
    if (opts.on instanceof Object) {
      eventHandlers = buildHooks(opts.on)
    }

    return createForm(el, resource, opts).then(form => {
      console.log('SFDS form created!')

      const { element } = form

      element.classList.add('d-flex', 'flex-column-reverse', 'mb-4')
      if (options.googleTranslate === false) {
        element.classList.add('notranslate')
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
      patchAddressManualMode(model)
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

  // this goes last so that if it fails it doesn't break everything else
  patchLanguageObserver()
}

function patchAddressManualMode (model) {
  const addresses = util.searchComponents(model.components, { type: 'address' })
  for (const component of addresses) {
    // FIXME no combination of these seems to make the nested
    // fields render...
    component.mode = 'manual'
    component.enableManualMode = true
    component.manualMode = true
  }
}

function patchSelectMode (model) {
  const selects = util.searchComponents(model.components, { type: 'select' })
  for (const component of selects) {
    component.widget = 'html5'
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
  const closestLangElement = form.element.closest('[lang]')
  if (closestLangElement) {
    form.language = closestLangElement.getAttribute('lang')
  }
}

function hook (obj, methodName, wrapper) {
  const method = obj[methodName]
  obj[methodName] = function (...args) {
    return wrapper.call(this, method, args)
  }
}

function mergeObjects (a, b) {
  for (const [key, value] of Object.entries(b)) {
    if (a[key] instanceof Object && value instanceof Object) {
      a[key] = mergeObjects(a[key], value)
    } else {
      a[key] = value
    }
  }
  return a
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
    const bound = t.bind(this)
    if (Array.isArray(keys)) {
      const last = keys.length - 1
      const fallback = (key, index) => {
        const value = bound(key, params)
        return value === key ? (index === last) ? value : '' : value
      }
      return keys.reduce((value, key, index) => {
        return value || fallback(key, index)
      }, '')
    } else {
      return bound(keys, params)
    }
  })
}
