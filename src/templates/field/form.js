import { html, If } from '../../html'

export const descriptionHiddenTypes = [
  'checkbox',
  'radio',
  'selectboxes'
]
export const descriptionAboveTypes = [
  'address',
  'checkbox',
  'radio',
  'review',
  'selectboxes',
  'well'
]

export default ctx => {
  const { type } = ctx.component
  const desc = If(!descriptionHiddenTypes.includes(type) && ctx.tk('description'), desc => html`
    <div class="fg-light-slate mt-1">
      ${desc}
    </div>
  `)
  const descriptionAbove = descriptionAboveTypes.includes(type)
  return html`
    ${html`${ctx.labelMarkup}`}
    ${If(desc && descriptionAbove, desc)}
    ${html`${ctx.element}`}
    ${If(desc && !descriptionAbove, desc)}
  `
}
