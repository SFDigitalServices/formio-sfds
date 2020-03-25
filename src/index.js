import { observe } from 'selector-observer'
import templates from './templates'
import { observeIcons } from './icons'

const framework = 'sfds'

export default {
  framework,
  templates: {
    [framework]: templates
  }
}

observeIcons()
hideErrorListings()

function hideErrorListings () {
  observe('#formio > [role=alert]', {
    add (el) {
      el.hidden = true
    }
  })
}
