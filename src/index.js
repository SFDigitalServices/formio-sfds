import components from './components'
import patch, { forms } from './patch'
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

const hiddenProps = {
  forms,
  version
}

for (const [prop, value] of Object.entries(hiddenProps)) {
  Object.defineProperty(plugin, prop, {
    enumerable: false,
    get () { return value }
  })
}

export default plugin
export { patch }

observeIcons()
