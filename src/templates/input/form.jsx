import { template } from 'jsx-string-template'

export default template(props => {
  const Type = props.input.type
  const prefix = props.tk('prefix') || props.prefix
  const suffix = props.tk('suffix') || props.suffix
  const attrs = Object.assign(
    { required: props.component?.validate?.required },
    props.input.attr
  )

  const input = (
    <>
      <div class='form-input'>
        <Type
          ref={props.input.ref || 'input'}
          id={props.inputId()}
          {...attrs}
          spellcheck={props.input.attr?.spellcheck && 'true'}
        >
          {props.input.content}
        </Type>
      </div>
      {props.component.showCharCount && <span class='text-muted pull-right' ref='charcount' />}
      {props.component.showWordCount && <span class='text-muted pull-right' ref='wordcount' />}
    </>
  )

  if (prefix || suffix) {
    return (
      <div class='input-group'>
        {prefix &&
          <div class='input-group-prepend' ref='prefix'>
            <span class='input-group-text' innerHTML={outerHTML(prefix)} />
          </div>}
        {input}
        {suffix &&
          <div class='input-group-append' ref='suffix'>
            <span class='input-group-text' innerHTML={outerHTML(suffix)} />
          </div>}
      </div>
    )
  } else {
    return input
  }
})

function outerHTML (stringOrNode) {
  return (stringOrNode && stringOrNode.nodeName)
    ? stringOrNode.outerHTML
    : stringOrNode
}
