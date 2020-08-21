import { fallbackCSS } from './utils'

export default class SFGovFormData extends window.HTMLElement {
  static get elementName () {
    return 'sfgov-form-data'
  }

  static register () {
    window.customElements.define(SFGovFormData.elementName, SFGovFormData)
  }

  constructor () {
    super()
    fallbackCSS(this, 'display', 'block')
  }

  get form () {
    const id = this.getAttribute('data-form-id')
    return id ? document.getElementById(id) : null
  }

  get input () {
    return this.querySelector('textarea')
  }

  init (form) {
    this.update(form)
    this.listener = () => this.update(form)
    form.on('change', this.listener)
  }

  update (form) {
    const { submission = {} } = form
    this.input.innerHTML = JSON.stringify(submission.data || {}, null, 2)
  }

  connectedCallback () {
    const el = this.form
    if (el && el.form) {
      this.init(el.form)
    } else if (el) {
      el.addEventListener('form:ready', () => {
        this.init(el.form)
      })
    } else {
      this.input.innerHTML = 'No form found!'
    }
  }

  disconnectedCallback () {
    if (this.listener) {
      this.form.off('change', this.listener)
      this.listener = null
    }
  }
}
