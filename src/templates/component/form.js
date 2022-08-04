import { vhtml } from '../../html'

export default ctx => {
  return vhtml('div', {
    id: ctx.id,
    class: ctx.classes,
    style: ctx.styles,
    ref: 'component',
    hidden: !ctx.visible,
    dangerouslySetInnerHTML: {
      __html: `
        ${ctx.children}
        <div class="messages" ref="messageContainer"></div>
      `
    }
  })
}
