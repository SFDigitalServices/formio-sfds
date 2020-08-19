/*
 * NOTE: we're only importing *custom* components and templates here, because
 * customizing the CSS on the form.io portal is basically impossible.
 */
import templates from './templates/custom'
import components from './components'
import builderComponents from './components/builder'

const { Formio } = window

const options = {
  builder: {
    builder: {
      sfgov: {
        title: 'SF.gov',
        weight: -100, // bring it to the top, baby
        default: true, // open by default
        components: builderComponents
      },
      basic: {
        default: true // set this to false to collapse it
      },
      premium: false
    }
  }
}

const framework = 'sfds'

Formio.use({
  framework,
  components,
  options,
  templates: {
    [framework]: templates
  }
})
