// ugh, FIXME! this pollutes the global namespace
import 'uri-template-lite'

const { URI } = window

export { uriTemplate, interp }

function uriTemplate (template) {
  const uri = new URI.Template(template)
  return data => uri.expand(data)
}

function interp (template, data) {
  return (typeof template === 'function') ? template(data) : URI.expand(template, data)
}
