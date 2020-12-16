import components from './components'
import patch from './patch'
import templates from './templates'
import { observeIcons } from './icons'
import { version } from '../package.json'

const framework = 'sfds'

const plugin = {
  framework,
  version,
  components,
  templates: {
    [framework]: templates
  }
}

export default plugin
export { patch }

observeIcons()
