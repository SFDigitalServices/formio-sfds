import { Formio } from 'formiojs'

export default class SFDSFormIO extends window.HTMLElement {
  connectedCallback () {
    const resource = this.getAttribute('data-resource')
    if (resource) {
      Formio.createForm(this, resource).then(form => {
        this.form = form
      })
    } else {
      throw new Error(`<${this.tagName}> requires a data-resource attribute`)
    }
  }
}
