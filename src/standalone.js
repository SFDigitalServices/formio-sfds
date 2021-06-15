// This file doesn't exist until it's built, but we should be able to lint
// without building, so...
// eslint-disable-next-line import/no-unresolved
import '../dist/formio-sfds.css'
import FormioSFDS, { patch } from './index.js'

const { Formio } = window

patch(Formio)
Formio.use(FormioSFDS)

window.FormioSFDS = FormioSFDS
