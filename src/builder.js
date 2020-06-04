import FormioSFDS, { patch } from '.'

const { Formio } = window

patch(Formio)
Formio.use(FormioSFDS)

window.FormioSFDS = FormioSFDS
