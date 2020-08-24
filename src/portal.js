/*
 * NOTE: we're only importing *custom* components and templates here, because
 * customizing the CSS on the form.io portal is basically impossible.
 */
import templates from './templates/custom'
import components from './components'

// these are "classless" components: templates for existing components
// that don't need any custom functionality or templates
import builderComponents from './components/builder'

const { Formio } = window

const framework = 'sfds'

Formio.use({
  framework,
  components,
  options: {
    builder: {
      builder: {
        sfgov: {
          title: 'SF.gov',
          weight: -100, // bring it to the top
          default: true, // open by default
          components: builderComponents
        },
        basic: {
          // set this to false to collapse it by default
          default: true
        }
      }
    }
  },
  templates: {
    [framework]: templates
  }
})
