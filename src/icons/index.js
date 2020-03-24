import { observe } from 'selector-observer'
import ArrowRight from './Arrow Right.svg'
import ArrowLeft from './Arrow Left.svg'
import Info from './Info.svg'
import Pencil from './Pencil.svg'

const icons = {
  ArrowRight,
  ArrowLeft,
  Info,
  Pencil,
  active: Pencil,
  error: Info
}

export default icons
export { getIcon, observeIcons }

function getIcon (name) {
  return icons[name]
}

function observeIcons() {
  observe('[data-icon]', {
    add (el) {
      const icon = getIcon(el.getAttribute('data-icon'))
      if (icon) {
        el.innerHTML = icon
        const svg = el.getElementsByTagName('svg')[0]
        const desired = {
          width: el.getAttribute('data-width'),
          height: el.getAttribute('data-height') || 16
        }
        if (desired.width) {
          svg.setAttribute('width', desired.width)
        } else if (desired.height) {
          svg.setAttribute('height', desired.height)
        }
      }
    }
  })
}
