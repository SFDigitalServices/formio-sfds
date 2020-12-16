import components from './components'
import patch from './patch'
import templates from './templates'
import { observeIcons } from './icons'
import { version } from '../package.json'

const framework = 'sfds'

const plugin = {
  framework,
  components,
  options: {},
  templates: {
    [framework]: templates
  }
}

Object.defineProperty(plugin, 'version', {
  // Formio complains about the "version" key if
  // the property is enumerable :shrug:
  enumerable: false,
  get () {
    return version
  }
})

export default plugin
export { patch }

observeIcons()
