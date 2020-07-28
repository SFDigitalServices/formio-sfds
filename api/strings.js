import fetch from 'node-fetch'
import { getStrings, getCondition } from '../lib/i18n'

const formatters = {
  nested: formatNestedJSON,
  debug: formatDebug
}

const keyedPaths = [
  'label',
  'description',
  'content',
  'prefix',
  'suffix'
]

module.exports = (req, res) => {
  const { formUrl, format = 'debug', ...params } = req.query
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

  fetch(formUrl)
    .then(res => res.json())
    .then(form => {
      const strings = getStrings(form)
      const data = formatter(strings, params)
      res.json(data)
    })
}

function formatNestedJSON (strings, params) {
  const nested = {}
  for (const str of strings) {
    const { value, key } = str
    nested[key] = value
  }
  return nested
}

function formatDebug (strings, options) {
  return {
    data: strings.map(({ component, parents, ...str }) => {
      const cond = getCondition(component)
      str.component = component.key
      str.parents = parents.map(parent => parent.key)
      if (cond) {
        str.condition = cond
      }
      return str
    })
  }
}
