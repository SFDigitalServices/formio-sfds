import interpolate from 'interpolate'

export { createTemplate, interp }

function createTemplate (template) {
  return data => interp(template, data)
}

function interp (template, data) {
  return (typeof template === 'function') ? template(data) : interpolate(template, data)
}
