import { Formio } from 'formiojs'
import sfds from './index'
import FormioSFDS from './element'
import './scss/index.scss'

Formio.use(sfds)

window.customElements.define('formio-sfds', FormioSFDS)
