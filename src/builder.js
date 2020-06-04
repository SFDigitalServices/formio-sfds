import FormioSFDS, { patch } from '.'
import { hook } from './patch'

delete FormioSFDS.templates

const { Formio } = window

patch(Formio, {
  icons: false
})

hook(Formio.FormBuilder.prototype, 'create', function (create, args) {
  this.options = FormioSFDS.options
  return create(args)
})

Formio.use(FormioSFDS)

export default FormioSFDS
