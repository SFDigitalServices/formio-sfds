import { html, If } from '../../html'

export default ctx => {
  const { component, input } = ctx
  return html`
    <${input.type}
      ref="button"
      class="btn btn-${ctx.transform('theme', ctx.component.theme)} ${component.customClass}"
      ...${ctx.input.attr}
    >
      ${If(component.leftIcon, c => html`
        <span class="${c}"/>&nbsp;
      `)}
      ${input.content}
      ${If(component.tooltip, () => html`
        <i ref="tooltip" class="${ctx.iconClass('question-sign')} text-muted" />
      `)}
      ${If(component.rightIcon, c => html`
        &nbsp;<span class="${c}"/>
      `)}
    </${input.type}>
  `
}
