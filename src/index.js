import components from './components'
import patch from './patch'
import templates from './templates'
import options from './options'
import 'regenerator-runtime'

const framework = 'sfds'

const plugin = {
  components,
  framework,
  options,
  templates: {
    [framework]: templates
  }
}

export default plugin
export { patch }
