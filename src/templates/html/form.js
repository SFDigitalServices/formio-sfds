import { html, vhtml, attrMap } from '../../html'

export default ctx => {
  const { component } = ctx
  const key = component.type === 'content'
    ? 'html'
    : 'content'
  return vhtml(ctx.tag, {
    ref: 'html',
    class: component.className,
    ...attrMap(ctx.attrs)
  }, html`${ctx.tk(key, ctx.content)}`)
}
