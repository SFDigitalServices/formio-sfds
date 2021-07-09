/** @jsx h */
import h from 'vhtml'

export default (ctx) => {
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
}
