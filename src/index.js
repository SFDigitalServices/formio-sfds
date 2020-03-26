import patch from './patch'
import templates from './templates'
import { observeIcons } from './icons'

const framework = 'sfds'

const plugin = {
  framework,
  templates: {
    [framework]: templates
  }
}

export default plugin
export { patch }

observeIcons()
