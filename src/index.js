import { observe } from 'selector-observer'
import templates from './templates'
import { observeIcons } from './icons'

export default {
  framework: 'sfds',
  templates: {
    sfds: templates
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
