import { html } from '../../html'

export default ctx => {
  const attrs = {
    ...(ctx.component.validate.required && {
      required: true,
      'aria-required': true
    }),
    ...(ctx.multiple && { multiple: true }),
    ...ctx.input.attr
  }
  return html`
    <select
      id="${ctx.inputId()}"
      ref="${ctx.input.ref || 'selectContainer'}"
      ...${attrs}
      dangerouslySetInnerHTML="${{ __html: ctx.selectOptions }}"
    />
  `
}
