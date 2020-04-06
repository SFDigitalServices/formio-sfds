import i18n from './i18n'
import buildHooks from './hooks'

const wrapperClass = 'formio-sfds'
const PATCHED = `sfds-patch-${Date.now()}`

let util

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
    const { lang: language } = el.lang
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

      form.element.classList.add('d-flex', 'flex-column-reverse', 'mb-4')

      const wrapper = document.createElement('div')
      wrapper.className = wrapperClass
      form.element.parentNode.insertBefore(wrapper, form.element)
      wrapper.appendChild(form.element)

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

      return form
    })
  })
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

function hook (obj, methodName, wrapper) {
  const method = obj[methodName].bind(obj)
  obj[methodName] = (...args) => wrapper.call(obj, method, args)
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
