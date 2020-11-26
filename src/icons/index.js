import { observe } from 'selector-observer'
import next from './Arrow-right.svg'
import prev from './Arrow-left.svg'
import calendar from './Calendar.svg'
import check from './Check.svg'
import chevron from './Chevron.svg'
import close from './Close.svg'
import document from './Document.svg'
import alert from './Alert.svg'
import pencil from './Pencil.svg'
import plus from './Plus.svg'
import square from './Square.svg'

const icons = {
  active: pencil,
  add: plus,
  calendar,
  check,
  chevron,
  close,
  delete: close,
  document,
  error: alert,
  alert,
  next,
  pencil,
  plus,
  prev,
  square
}

export default icons
export { getIcon, observeIcons }

function getIcon (name) {
  return icons[name]
}

function observeIcons () {
  observe('i.fa', {
    add (el) {
      const match = el.className.match(/\bfa-([-\w]+)\b/)
      if (match) {
        const name = match[1]
        if (name in icons) {
          el.classList.remove('fa', `fa-${name}`)
          if (el.parentNode.classList.contains('input-group-text')) {
            el.classList.add('d-flex')
          }
          el.setAttribute('data-icon', name)
        } else {
          console.warn('no such icon: "%s"', name, el)
        }
      }
    }
  })

  observe('[data-icon]', {
    add (el) {
      const icon = getIcon(el.getAttribute('data-icon'))
      if (icon) {
        el.classList.add('notranslate')
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
