import { html, If } from '../../html'

export const hideLabelTypes = ['address', 'button', 'checkbox', 'radio', 'selectboxes']

export default ctx => {
  const hidden = ctx.component.hideLabel || hideLabelTypes.includes(ctx.component.type)
  return If(!hidden, () => html`
    <label class="${ctx.label.className}" for="${ctx.inputId()}">
      ${ctx.tk('label')}
    </label>
  `)
}
