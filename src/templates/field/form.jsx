import vdo from 'vdo'

export default (props) => {
  const { component = {}, className } = props
  const { type = 'component', key = type } = component
  const desc = props.t([`${key}.description`, component.description || ''])
  return (
    <div class={className}>
      {vdo.markSafe(props.labelMarkup)}
      {vdo.markSafe(props.element)}
      {desc && ['address', 'review', 'checkbox', 'well'].indexOf(props.component.type) === -1
        ? <Description>{desc}</Description>
        : null}
    </div>
  )
}

function Description (props) {
  return <div className='fg-light-slate' {...props} />
}
