const { content: ContentComponent } = window.Formio.Components.components

export default class Content extends ContentComponent {
  get content () {
    const submission = this.root?.submission || {}
    const html = this.t([`${this.component.key}.html`, this.component.html])
    // console.warn('[%s] get content(): %s -> %s <-', this.component.type, this.component.html, html, this.rootValue)
    const content = html
      ? this.interpolate(html, {
        metadata: submission.metadata || {},
        submission: submission,
        data: this.rootValue,
        row: this.data
      })
      : ''
    return content || ''
  }
}
