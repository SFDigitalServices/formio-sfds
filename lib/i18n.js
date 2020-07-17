
module.exports = {
  getCondition,
  getStrings
}

function getStrings (form) {
  const fields = [
    fieldGetter('label', (label, component) => {
      switch (component.type) {
        case 'content': // we don't show labels for content components
        case 'htmlelement': // we don't show labels for HTML elements
        case 'panel': // panels use the title, not the label
          return []
        default:
          if (label && !component.hideLabel) {
            return [new UIString(label, { path: 'label' })]
          }
      }
    }),
    fieldGetter('title', (value, component) => {
      if (component.type === 'panel' && value) {
        return [new UIString(value, { path: 'title' })]
      }
    }),
    fieldGetter('description'),
    fieldGetter('content'),
    fieldGetter('suffix'),
    fieldGetter('values', (values, component) => {
      return fieldValues(values, 'values', 'label')
    }),
    fieldGetter('data', (data, component) => {
      const { dataSrc, template } = component
      const { values } = data
      if (Array.isArray(values) && (!dataSrc || dataSrc === 'values')) {
        const match = (typeof template === 'string')
          ? template.match(/{{\s*item\.(\w+)\s*}}/)
          : false
        const labelProperty = match ? match[1] : 'label'
        return fieldValues(values, 'data.values', labelProperty)
      } else {
        console.info('Skipping data for component "%s" (dataSrc: "%s"), length: %d', component.key, dataSrc, values.length)
      }
    }),
    fieldGetter('validate', ({ customMessage, custom }, component) => {
      const strings = []
      if (customMessage) {
        strings.push(new UIString(customMessage, { path: 'validate.customMessage' }))
      }
      if (custom) {
        /**
         * XXX This regular expression matches anything that _looks_ like a
         * double-quoted string. It won't capture single-quoted strings.
         */
        const possibleStrings = custom.match(/"([^"]+)"/g) || []
        for (const possibleString in possibleStrings) {
          // only include double-quoted strings that aren't entirely numeric
          if (possibleString && !/^\d+$/.test(possibleString)) {
            strings.push(new UIString(possibleString, { path: 'validate.custom' }))
          }
        }
      }
      return strings
    }),
    fieldGetter('customError', (customError, component) => {
      return customError
        ? [new UIString(customError, { path: 'customError' })]
        : []
    })
  ]

  const all = []
  eachComponent(form.components, (component, index, parents) => {
    for (const getFieldStrings of fields) {
      const strings = getFieldStrings(component)
        .filter(data => data && data.value)
      for (const str of strings) {
        Object.assign(str, { component, parents })
      }
      all.push(...strings)
    }
  })

  for (const str of all) {
    str.value.replace(/\$t\((.*?)\)/g, (_, key) => {
      all.push(new StringInterpolation(key, str))
    })
  }

  return all

  function fieldGetter (path, get) {
    if (get) {
      return component => {
        return (path in component)
          ? get(component[path], component) || []
          : []
      }
    } else {
      return component => {
        return (path in component)
          ? [new UIString(component[path], { path, component })]
          : []
      }
    }
  }

  function fieldValues (values, path, property) {
    return values.map((value, index) => {
      return new UIString(value[property], { path: `${path}[${index}].${property}` })
    })
  }
}

function eachComponent (components, iter, parents = []) {
  for (const [index, component] of Object.entries(components)) {
    const next = iter(component, index, parents || [])
    if (next === true) return component
    else if (next === false) return
    let children = component.components
    if (!children && component.columns) {
      children = component.columns.reduce((list, column) => list.concat(column.components), [])
    }
    if (children && children.length) {
      eachComponent(children, iter, parents.concat(component))
    }
  }
}

function getCondition (component) {
  const { customConditional, conditional } = component
  return customConditional || (conditional && conditional.show ? conditional : null)
}

class UIString {
  constructor (value, props) {
    this.value = value
    this.type = 'string'
    Object.assign(this, props)
  }
}

class StringInterpolation {
  constructor (value, string) {
    this.value = value
    this.type = 'interpolation'
    this.referrer = string
    Object.assign(this, string)
  }
}