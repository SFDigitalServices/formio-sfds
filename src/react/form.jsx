import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import '../../dist/formio-sfds.standalone.js'

const { Formio } = window

export function Form (props) {
  const {
    // components={[...]} is shorthand for dataSource={{ components: [...] }}
    components,
    dataSource = { components },
    options,
    ...rest
  } = props
  const ref = useRef()
  const form = useForm(ref, dataSource, options)
  console.log('form:', form)
  return <div {...rest} ref={ref} />
}

Form.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.object
  ),
  dataSource: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  options: PropTypes.shape({
    language: PropTypes.string
  })
}

export function useForm (
  /** @type {import('react').Ref<HTMLElement>} */
  ref,
  /** @type {string | Object} */
  dataSource,
  /** @type {Object} */
  options = {}
) {
  const [
    /** @type {import('formiojs').Form} */
    form,
    setForm
  ] = useState()
  const {
    page,
    on: handlers,
    submission,
    ...restOptions
  } = options || {}
  useEffect(() => {
    if (!form && ref.current) {
      Formio.createForm(
        ref.current.appendChild(document.createElement('div')),
        dataSource,
        restOptions
      ).then(form => {
        if (handlers instanceof Object) {
          for (const [event, handler] of Object.entries(handlers)) {
            form.on(event, handler)
          }
        }
        if (submission) {
          form.submission = submission
        }
        setForm(form)
      })
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
  }, [ref, dataSource, restOptions])

  useEffect(() => {
    if (form && !isNaN(page)) {
      form.setPage(page)
    }
  }, [form, page])

  return form
}
