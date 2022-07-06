import dot from 'dotmap'
import classnames from 'classnames'

export default {
  classnames,

  inputId () {
    const parts = [
      'input',
      this.component.row,
      this.id || this.input?.attr?.name
    ].filter(Boolean)
    return parts.join('-')
  },

  tk (field, defaultValue = '') {
    const { component = {} } = this
    const { type, key = type } = component
    return key
      ? this.t([
        `${key}.${field}`,
        // this is the "legacy" naming scheme
        `${key}_${field}`,
        `component.${type}.${field}`,
        dot.get(component, field) || defaultValue || ''
      ])
      : defaultValue
  },

  requiredAttributes () {
    return this.component?.validate?.required
      ? 'required aria-required="true"'
      : ''
  }
}
