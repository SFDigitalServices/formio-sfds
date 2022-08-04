import { html, If, omit } from '../../html'

export default ctx => {
  return html`
    <div class="form-checkbox">
      <label class="d-flex flex-items-center fs-inherit fg-inherit">
        <span class="flex-shrink-0 flex-self-start">
          <${ctx.input.type}
            class="input-checkbox position-relative d-block mr-2 mb-0"
            ref="input"
            value="${ctx.value}"
            checked="${ctx.checked}"
            ...${omit(ctx.input.attr, 'class')}
          />
        </span>
        <span class="flex-auto">
          <span class="label-required">
            ${ctx.tk('label')}
          </span>
          ${If(ctx.tk('description'), desc => html`
            <span class="d-block fg-light-slate small">
              ${desc}
            </span>
          `)}
        </span>
      </label>
    </div>

  `
}
