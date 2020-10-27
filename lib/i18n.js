const dot = require('dotmap')

class UIString {
  static key (component, path) {
    return `${component.key}.${path}`
  }

  constructor (value, component, path, context) {
    if (!value) {
      throw new Error('UIString() requires a value as its first argument')
    } else if (!(component instanceof Object)) {
      throw new Error('UIString() requires a component as its second argument')
    } else if (!component.key) {
      throw new Error('UIString() requires a component object with a "key" property')
    }
    Object.assign(this, {
      value,
      component,
      path,
      _context: context
    })
  }

  get type () {
    return 'string'
  }

  get key () {
    return this.path ? UIString.key(this.component, this.path) : this.value
  }

  get context () {
    return this._context && UIString.key(this.component, this._context)
  }
}

class StringInterpolation extends UIString {
  constructor (value, str) {
    const { component, path, context } = str
    super(value, component, path, context)
    this.string = str
  }

  get type () {
    return 'interpolation'
  }

  get key () {
    return this.value
  }

  get context () {
    return super.key
  }
}

module.exports = {
  getCondition,
  getStrings,
  UIString,
  StringInterpolation
}

function getStrings (form) {
  const fields = [
    fieldGetter('label', (label, component, path) => {
      switch (component.type) {
        case 'content': // we don't show labels for content components
        case 'htmlelement': // we don't show labels for HTML elements
        case 'panel': // panels use the title, not the label
          return []
        default:
          if (label && !component.hideLabel) {
            return [new UIString(label, component, path)]
          }
      }
    }),
    fieldGetter('title', (value, component, path) => {
      if (component.type === 'panel' && value) {
        return [new UIString(value, component, path)]
      }
    }),
    fieldGetter('description'),
    // NB: "html" components have a "content" field
    fieldGetter('html', (value, component, path) => {
      if (component.type === 'content' && value) {
        return [new UIString(value, component, path)]
      }
    }),
    // NB: "content" components have an "html" field
    fieldGetter('content', (value, component, path) => {
      if (component.type === 'html' && value) {
        return [new UIString(value, component, path)]
      }
    }),
    fieldGetter('suffix'),
    fieldGetter('values', (values, component, path) => {
      return Array.isArray(values) && values.map(({ label, value }) => {
        return new UIString(label, component, `values.${value}`)
      })
    }),
    fieldGetter('data', (data, component, path) => {
      const { dataSrc } = component
      const { values } = data
      if (Array.isArray(values) && (!dataSrc || dataSrc === 'values')) {
        return values.map(({ label, value }) => {
          return new UIString(label, component, `values.${value}`)
        })
      } else {
        console.info('Skipping data for component "%s" (dataSrc: "%s"), length: %d', component.key, dataSrc, values.length)
      }
    }),
    fieldGetter('validate', ({ customMessage, custom }, component) => {
      const strings = []
      if (customMessage) {
        strings.push(new UIString(customMessage, component, 'validate.customMessage'))
      }

      if (custom) {
        /**
         * XXX These patterns match anything that _looks_ like
         * a quoted string. We're not doing anything fancy
         * here, and quotes within strings will almost
         * certainly confuse it. For example:
         *
         * `valid = data['x'] || "it's foo"`
         *
         * will yield two "strings" `x` and `] || "it`.
         *
         * If we're only ever going to run this server-side,
         * then we could parse it as JS and only look for
         * string expressions that aren't property accessors.
         */
        const matches = [
          ...custom.matchAll(/."([^"]+)"/g),
          ...custom.matchAll(/.'([^']+)'/g)
        ]
        // eslint-disable-next-line no-unused-vars
        for (const [str, substr] of matches) {
          if (str.startsWith('[') || /^\d+$/.test(substr)) {
            // console.warn('ignoring possible property accessor: "%s"', str)
            continue
          }
          strings.push(new UIString(substr, component, null, 'validate.custom'))
        }
      }
      return strings
    }),
    fieldGetter('customError', (customError, component, path) => {
      return customError
        ? [new UIString(customError, component, path)]
        : []
    }),
    fieldGetter('properties.backTitle', (title, component) => {
      return title
        ? [new UIString(title, component, 'form.backTitle')]
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
        return value ? get(value, component, path) || [] : []
      }
    } else {
      return component => {
        const value = dot.get(component, path)
        return value ? [new UIString(value, component, path)] : []
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
