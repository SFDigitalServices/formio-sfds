import i18n from './i18n'

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

  hook(Formio, 'createForm', (createForm, [el, resource, options = {}]) => {
    // get the default language from the element's (inherited) lang property
    const language = el.lang || document.documentElement.lang
    const opts = mergeObjects({ i18n, language }, options)

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

      const model = { ...form.form }
      patchAddressManualMode(model)
      patchSelectMode(model)
      form.form = model

      updateLanguage(form)
      forms.push(form)

      return form
    })
  })

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
