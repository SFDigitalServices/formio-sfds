import FormioSFDS, { patch } from '.'

delete FormioSFDS.templates

const { Formio } = window

// FIXME: this hack appears to be necessary to override the form builder
// default options
Formio.FormBuilder.options = FormioSFDS.options

patch(Formio)
Formio.use(FormioSFDS)

export default FormioSFDS
