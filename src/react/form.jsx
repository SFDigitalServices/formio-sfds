import React from 'react'
import PropTypes from 'prop-types'
import { Form, Formio, Utils } from '@formio/react'
// FIXME: we have to import from the built JS because EJS
import theme, { patch } from '../../dist/formio-sfds.mjs'

Object.assign(window, {
  Formio,
  FormioUtils: Utils
})

Formio.use(theme)
patch(Formio)

export { Form }

export function SingleComponentForm ({ component, ...rest }) {
  return <Form form={{
    type: 'form',
    components: [component]
  }} {...rest} />
}

SingleComponentForm.propTypes = {
  component: PropTypes.object
}

export function Wizard ({ pages = [], ...rest }) {
  return <Form form={{
    type: 'form',
    display: 'wizard',
    components: pages
  }} {...rest} />
}

Wizard.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.object)
}
