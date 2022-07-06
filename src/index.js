import '../dist/formio-sfds.css'
import components from './components'
import patch, { forms } from './patch'
import templates from './templates'
import evalContext from './context'
import { observeIcons } from './icons'
import { version } from '../package.json'

const framework = 'sfds'

const plugin = Object.defineProperties({
  framework,
  components,
  options: {
    form: {
      evalContext
    }
  },
  templates: {
    [framework]: templates
  }
}, {
  forms: {
    enumerable: false,
    get: () => forms
  },
  version: {
    enumerable: false,
    get: () => version
  }
})

export default plugin
export { patch, observeIcons }
