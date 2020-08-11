const dot = require('dotmap')

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
            return [new UIString(label, { component, path: 'label' })]
          }
      }
    }),
    fieldGetter('title', (value, component) => {
      if (component.type === 'panel' && value) {
        return [new UIString(value, { component, path: 'title' })]
      }
    }),
    fieldGetter('description'),
    fieldGetter('content'),
    fieldGetter('html'),
    fieldGetter('suffix'),
    fieldGetter('values', (values, component) => {
      return values.map(({ label, value }) => {
        return new UIString(label, { component, path: `values.${value}` })
      })
    }),
    fieldGetter('data', (data, component) => {
      const { dataSrc } = component
      const { values } = data
      if (Array.isArray(values) && (!dataSrc || dataSrc === 'values')) {
        return values.map(({ label, value }) => {
          return new UIString(label, { component, path: `values.${value}` })
        })
      } else {
        console.info('Skipping data for component "%s" (dataSrc: "%s"), length: %d', component.key, dataSrc, values.length)
      }
    }),
    fieldGetter('validate', ({ customMessage, custom }, component) => {
      const strings = []
      if (customMessage) {
        strings.push(new UIString(customMessage, {
          component,
          path: 'validate.customMessage'
        }))
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
            strings.push(new UIString(possibleString, {
              component,
              path: 'validate.custom'
            }))
          }
        }
      }
      return strings
    }),
    fieldGetter('customError', (customError, component) => {
      return customError
        ? [new UIString(customError, { component, path: 'customError' })]
        : []
    })
  ]

  const all = []
  eachComponent(form.components, (component, index, parents) => {
    for (const getFieldStrings of fields) {
      const strings = getFieldStrings(component)
        .filter(str => str && str.value)
      for (const str of strings) {
        Object.assign(str, { parents })
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
        const value = dot.get(component, path)
        return value !== undefined
          ? get(value, component) || []
          : []
      }
    } else {
      return component => {
        const value = dot.get(component, path)
        return value !== undefined
          ? [new UIString(value, { path, component })]
          : []
      }
    }
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
  static key (component, path) {
    return `${component.key}.${path}`
  }

  constructor (value, props) {
    this.value = value
    this.type = 'string'
    Object.assign(this, props)
    this.key = this.path || this.value
    if (this.component) {
      this.key = UIString.key(this.component, this.path)
    } else {
      console.warn('UIString with no component:', this)
    }
  }
}

class StringInterpolation extends UIString {
  constructor (value, string) {
    super(value, string)
    this.type = 'interpolation'
    this.key = this.value
  }
}
