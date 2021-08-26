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
    fieldGetter('html'),
    fieldGetter('content'),
    fieldGetter('suffix'),
    fieldGetter('values', (values, component, path) => {
      return Array.isArray(values) && values.map(({ label, value }) => {
        return label && new UIString(label, component, `values.${value}`)
      }).filter(Boolean)
    }),
    fieldGetter('data', (data, component, path) => {
      const { dataSrc } = component
      const { values } = data
      if (Array.isArray(values) && (!dataSrc || dataSrc === 'values')) {
        return values.map(({ label, value }) => {
          return label && new UIString(label, component, `values.${value}`)
        }).filter(Boolean)
      } else if (values) {
        console.info('Skipping data for component "%s" (dataSrc: "%s"), length: %d', component.key, dataSrc, values.length)
      } else {
        console.info('No values for data component "%s" (dataSrc: "%s")', component.key, dataSrc, values)
      }
    }),
    fieldGetter('validate.customMessage'),
    fieldGetter('errors', (errors, component, path) => {
      const strings = []
      for (const [type, value] of Object.entries(errors)) {
        if (value) {
          strings.push(new UIString(value, component, `errors.${type}`))
        }
      }
      return strings
    }),
    fieldGetter('customError', (customError, component, path) => {
      return customError
        ? [new UIString(customError, component, path)]
        : []
    }),
    fieldGetterAlias('properties.displayTitle', 'displayTitle', 'panel'),
    fieldGetterAlias('properties.backTitle', 'form.backTitle')
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

  function fieldGetterAlias (path, key, filter = () => true) {
    if (typeof filter === 'string') {
      const type = filter
      filter = component => component.type === type
    }
    return component => {
      const value = dot.get(component, path)
      return value && filter(component, value)
        ? [new UIString(value, component, key)]
        : []
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
