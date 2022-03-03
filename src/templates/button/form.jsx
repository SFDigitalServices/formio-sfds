/** @jsx node */
import { node } from 'jsx-pragmatic'
import { stringRenderer } from '../render'

export default stringRenderer((ctx) => {
  const {
    component,
    input: {
      type: Type,
      attr,
      content
    }
  } = ctx
  return (
    <Type
      ref='button'
      className={`btn btn-${ctx.transform('theme', component.theme)} ${component.customClass}`}
      {...attr}
    >
      {component.leftIcon && <span data-icon={component.leftIcon} />}
      {content}
      {component.rightIcon && <span data-icon={component.rightIcon} />}
    </Type>
  )
})
