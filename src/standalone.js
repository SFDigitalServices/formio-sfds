import FormioSFDS, { patch } from './index.js'

const { Formio } = window

patch(Formio)
Formio.use(FormioSFDS)

window.FormioSFDS = FormioSFDS
