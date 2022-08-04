import { html, If, stringify } from '../../html'

export default ctx => {
  const desc = ctx.tk('description')
  return html`
    <div class="formio-component formio-component-address round-1 bg-blue-1 p-2">
      <fieldset class="formio-nested">
        <legend class="${desc ? '' : 'mb-1'}">
          ${ctx.tk('label')}
        </legend>
        ${If(desc, () => html`<div class="mb-2">${desc}</div>`)}
        <div
          ref="${ctx.nestedKey}"
          dangerouslySetInnerHTML="${{ __html: stringify(ctx.children) }}"
        />
      </fieldset>
    </div>
  `
}
