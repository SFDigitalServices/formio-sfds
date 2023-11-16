const { htmlelement: FormioHTMLElementComponent } = window.Formio.Components.components

export default class HTMLElementComponent extends FormioHTMLElementComponent {
  get content () {
    const submission = this.root?.submission || {}
    const content = this.t([`${this.component.key}.content`, this.component.content])
    // console.warn('[%s] get content(): %s -> %s <-', this.component.type, this.component.content, content, data)
    return content
      ? this.interpolate(content, {
        metadata: submission.metadata || {},
        submission,
        data: this.rootValue,
        row: this.data
      })
      : ''
  }
}
