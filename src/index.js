import components from './components'
import patch from './patch'
import templates from './templates'
import { observeIcons } from './icons'
import 'regenerator-runtime'

const framework = 'sfds'

const plugin = {
  framework,
  components,
  templates: {
    [framework]: templates
  }
}

export default plugin
export { patch }

observeIcons()
