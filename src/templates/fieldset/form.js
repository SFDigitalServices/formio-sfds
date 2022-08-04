import { html, If } from '../../html'

export default ctx => {
  return html`
    <fieldset class="formio-nested">
      <legend ref="header">
        ${ctx.tk('legend')}
      </legend>
      ${If(ctx.tk('description'), desc => html`<div class="my-2">${desc}</div>`)}
      <div ref="${ctx.nestedKey}">
        ${html`${ctx.children}`}
      </div>
    </fieldset>
  `
}
