import { observe } from 'selector-observer'
import arrowRight from './Arrow Right.svg'
import arrowLeft from './Arrow Left.svg'
import close from './Close.svg'
import document from './Document.svg'
import info from './Info.svg'
import pencil from './Pencil.svg'

const icons = {
  arrowRight,
  arrowLeft,
  close,
  document,
  info,
  pencil,
  active: pencil,
  add: document,
  error: info,
  delete: close
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
