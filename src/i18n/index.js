import translations from './translations.json'

const i18n = Object.assign({
  error: 'Please fix the following errors:',
  invalid_date: '{{field}} is not a valid date',
  invalid_email: '{{field}} must be a valid email address',
  invalid_regex: '{{field}} does not match the required pattern',
  mask: '{{field}} does not match the required mask',
  max: '{{field}} cannot be greater than {{max}}',
  maxLength: '{{field}} must be shorter than {{length}} characters',
  min: '{{field}} cannot be less than {{min}}.',
  minLength: '{{field}} must be longer than {{length}} characters',
  next: 'Next',
  pattern: '{{field}} does not match the pattern "{{pattern}}"',
  previous: 'Previous',
  required: '{{field}} is required'
}, translations)

// console.warn('formio-sfds i18n:', i18n)

export default i18n
