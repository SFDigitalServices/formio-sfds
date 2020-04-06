import URI from 'uri-template-lite'

export { uriTemplate, interp }

function uriTemplate (template) {
  const uri = new URI.Template(template)
  return data => uri.expand(data)
}

function interp (template, data) {
  return (typeof template === 'function') ? template(data) : URI.expand(template, data)
}
