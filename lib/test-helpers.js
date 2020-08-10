export {
  createElement,
  createForm,
  destroyForm,
  sleep
}

function createElement (name = 'div', attrs = {}) {
  const el = document.createElement(name)
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

function createForm (form = {}, options = {}) {
  const el = createElement('div', {
    id: `form-${Date.now().toString(36)}`
  })
  document.body.appendChild(el)
  return global.Formio.createForm(el, form, options)
}

function destroyForm (form) {
  const { element } = form
  form.destroy()
  element.remove()
}

function sleep (ms = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
