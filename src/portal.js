import components from './components'
import templates from './templates/custom'

const { Formio } = window

const framework = 'sfds'

const options = {
  builder: {
    builder: require('./builder-options.yml')
  }
}

Formio.icons = 'fontawesome'

Formio.use({
  framework,
  components,
  options,
  templates: {
    [framework]: templates
  }
})
