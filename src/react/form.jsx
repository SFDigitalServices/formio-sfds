import { Formio } from 'formiojs'
import { useEffect, useRef, useState } from 'react'
import '../../dist/formio-sfds.standalone.js'

export function Form (props) {
  const { components, dataSource = { components }, options, ...rest } = props
  const ref = useRef()
  const form = useForm(ref, dataSource, options)
  return <div {...rest} ref={ref} />
}

export function useForm (
  /** @type {import('react').Ref<HTMLElement>} */
  ref,
  /** @type {string | Object} */
  dataSource,
  /** @type {Object} */
  options
) {
  const [
    /** @type {Formio} */
    form,
    setForm
  ] = useState()
  useEffect(() => {
    if (!form && ref.current) {
      Formio.createForm(
        ref.current.appendChild(document.createElement('div')),
        dataSource,
        // XXX: options is modified by the form, so we have to dereference it
        // by spreading here. You can always get them via form.options later.
        { ...options }
      ).then(setForm)
    }
    return () => {
      if (form) {
        const { element } = form
        try {
          form.destroy()
        } catch (error) {
          form.empty()
        }
        element.remove()
        setForm(undefined)
      }
    }
  }, [ref, dataSource, options])

  return form
}
