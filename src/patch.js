import i18n from './i18n'

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
    const opts = Object.assign({ i18n, language }, options)
    return createForm(el, resource, opts).then(form => {
      console.log('SFDS form created!')

      form.element.classList.add('d-flex', 'flex-column-reverse', 'mb-4')

      const wrapper = document.createElement('div')
      wrapper.className = wrapperClass
      form.element.parentNode.insertBefore(wrapper, form.element)
      wrapper.appendChild(form.element)

      const model = { ...form.form }
      patchAddressManualMode(model)
      patchSelectMode(model)
      form.form = model

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
