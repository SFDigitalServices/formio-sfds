import FormioSFDS, { patch } from '.'

delete FormioSFDS.templates

const { Formio } = window

patch(Formio)
Formio.use(FormioSFDS)

export default FormioSFDS
