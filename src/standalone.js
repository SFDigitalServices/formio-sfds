import 'sf-design-system/public/dist/css/all.css'
import '../dist/formio-sfds.css'

import FormioSFDS, { patch } from '.'

const { Formio } = window

patch(Formio)
Formio.use(FormioSFDS)

export default FormioSFDS
