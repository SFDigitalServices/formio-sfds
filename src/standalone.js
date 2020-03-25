import 'sf-design-system/public/dist/css/all.css'
import '../dist/formio-sfds.css'
import FormioSFDS from './index.js'

window.addEventListener('load', () => {
  window.Formio.use(FormioSFDS)
})
