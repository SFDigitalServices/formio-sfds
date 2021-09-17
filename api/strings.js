const dot = require('dot-component')
const fetch = require('node-fetch')
const { getStrings, getCondition } = require('../lib/i18n')

const formatters = {
  flat: formatFlatJSON,
  nested: formatNestedJSON,
  debug: formatDebug
}

module.exports = (req, res) => {
  const { formUrl, format = 'nested', ...params } = req.query
  if (!formUrl) {
    res.json({
      status: 502,
      error: 'The formUrl query string parameter is required'
    })
  }

  const formatter = formatters[format]
  if (!formatter) {
    return res.json({
      status: 500,
      error: `No such format: "${format}"`
    })
  }

  return fetch(formUrl)
    .then(res => res.json())
    .then(form => {
      const strings = getStrings(form)
      const data = formatter(strings, params)
      return res.json(data)
    })
}

function formatFlatJSON (strings, params) {
  const keys = {}
  for (const str of strings) {
    const { value, key } = str
    keys[key] = value
  }
  return keys
}

function formatNestedJSON (strings, params) {
  const nested = {}
  for (const str of strings) {
    const { value, key } = str
    dot.set(nested, key, value, true)
  }
  return nested
}

function formatDebug (strings, options) {
  return {
    data: strings.map(({ component, parents, ...str }) => {
      const cond = getCondition(component)
      str.component = {
        key: component.key,
        type: component.type
      }
      str.parents = parents.map(parent => parent.key)
      if (cond) {
        str.condition = cond
      }
      return str
    })
  }
}
