import { html, If } from '../../html'

export default ctx => {
  const { component } = ctx
  const isChecked = ctx.value instanceof Object
    ? value => ctx.value && Object.prototype.hasOwnProperty.call(ctx.value, value) && ctx.value[value]
    : value => ctx.value === value
  return html`
    <fieldset>
      ${If(!component.hideLabel, () => html`
        <legend class="${If(component.validate.required, 'field-required')}">
          ${ctx.tk('label')}
        </legend>
      `)}

      ${If(ctx.tk('description'), desc => html`
        <div class="fg-light-slate mt-1">
          ${desc}
        </div>
      `)}

      ${ctx.values.map(item => html`
        <label class="d-flex flex-items-center fs-inherit my-2">
          <span class="flex-shrink-0">
            <${ctx.input.type}
              ref="input"
              ...${ctx.input.attr}
              class="${
                /* setting this after spreading ctx.input.attr ensures that our classes "win" */
                `input-${ctx.input.attr.type} position-relative d-block mr-2 mb-0`
              }"
              value="${item.value}"
              id="${ctx.id}-${ctx.row}${item.value}"
              checked="${isChecked(item.value)}"
              disabled="${item.disabled}"
            />
          </span>
          <span class="flex-auto">
            ${ctx.t([`${ctx.component.key}.values.${item.value}`, item.label])}
          </span>
        </label>
      `)}
    </fieldset>
  `
}
