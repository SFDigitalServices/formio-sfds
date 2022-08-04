import vhtml from 'vhtml'

export default ctx => {
  return vhtml('i', {
    ref: ctx.ref,
    class: ctx.className,
    style: ctx.styles
  }, ctx.content)
}
