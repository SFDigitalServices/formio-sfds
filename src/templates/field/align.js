import { html, If } from '../../html'

export default ctx => {
  const {
    component,
    contentStyles,
    element,
    isRightAlign,
    isRightPosition,
    label,
    labelStyles
  } = ctx
  return html`
    <div class="field-wrapper ${isRightPosition ? 'field-wrapper--reverse' : ''}">
      ${!ctx.label.hidden && html`
        <div
          class="field-label ${isRightAlign ? 'field-label--right' : ''}"
          style="${labelStyles}"
          dangerouslySetInnerHTML="${{ __html: ctx.labelMarkup }}
        />
      `}
      ${If(label.hidden && label.className && component.validate.required, html`
        <div
          class="field-label ${isRightAlign ? 'field-label--right' : ''}"
          style="${labelStyles}"
        >
          <label class="${label.className}">${
            /* FIXME: there should be some text here! */
            ''
          }</label>
        </div>
      `)}
      <div
        class="filed-content"
        style="${contentStyles}"
        dangerouslySetInnerHTML="${{ __html: element }}"
      />
    </div>

    ${If(ctx.tk('description'), desc => html`
      <div class="form-text text-muted">
        ${desc}
      </div>
    `)}
  `
}
