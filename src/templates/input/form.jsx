import vdo from 'vdo'
const { HTMLElement } = window

export default props => {
  let { prefix, suffix, component } = props
  if (prefix instanceof HTMLElement) prefix = prefix.outerHTML
  if (suffix instanceof HTMLElement) suffix = suffix.outerHTML
  if (prefix || suffix) {
    return (
      <div class='input-group'>
        {prefix && (
          <div class='input-group-prepend' ref='prefix'>
            <span class='input-group-text'>
              {vdo.markSafe(props.t([`${component.key}_prefix`, prefix]))}
            </span>
          </div>
        )}
        <Input {...props} />
        {suffix && (
          <div class='input-group-append' ref='suffix'>
            <span class='input-group-text'>
              {vdo.markSafe(props.t([`${component.key}_suffix`, suffix]))}
            </span>
          </div>
        )}
      </div>
    )
  } else {
    return <Input {...props} />
  }
}

function Input (props) {
  const { component, input: { type: Type, attr, content, ref } } = props
  const required = component?.validate?.required
  return (
    <div class='form-input'>
      <Type
        ref={ref || 'input'}
        id={props.inputId()}
        required={required}
        aria-required={required ? 'true' : 'false'}
        {...attr}
      >
        {vdo.markSafe(content)}
      </Type>
    </div>
  )
}
