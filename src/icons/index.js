import { observe } from 'selector-observer'
import next from './Arrow-right.svg'
import prev from './Arrow-left.svg'
import close from './Close.svg'
import document from './Document.svg'
import alert from './Alert.svg'
import pencil from './Pencil.svg'
import plus from './Plus.svg'

const icons = {
  active: pencil,
  add: plus,
  close,
  delete: close,
  document,
  error: alert,
  alert,
  next,
  pencil,
  plus,
  prev
}

export default icons
export { getIcon, observeIcons }

function getIcon (name) {
  return icons[name]
}

function observeIcons () {
  observe('[data-icon]', {
    add (el) {
      const icon = getIcon(el.getAttribute('data-icon'))
      if (icon) {
        el.innerHTML = icon
        const svg = el.getElementsByTagName('svg')[0]
        const viewBox = svg.getAttribute('viewBox') || ''
        const defaultHeight = viewBox.split(' ')[3] || 20
        const desired = {
          width: el.getAttribute('data-width'),
          height: el.getAttribute('data-height') || defaultHeight
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
