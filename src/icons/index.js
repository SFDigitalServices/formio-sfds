import { observe } from 'selector-observer'
import square from './Square.svg'

const legacyIcons = {
  square
}

const aliases = {
  active: 'pencil',
  add: 'plus',
  chevron: 'chevron-down',
  delete: 'close',
  error: 'alert',
  next: 'arrow-right'
}

export function getIcon (name) {
  if (name in aliases) {
    name = aliases[name]
  }
  return legacyIcons[name]
}

export function observeIcons () {
  observe('i.fa', {
    add (el) {
      const match = el.className.match(/\bfa-([-\w]+)\b/)
      if (match) {
        const name = match[1]
        el.classList.remove('fa', `fa-${name}`)
        if (el.parentNode.classList.contains('input-group-text')) {
          el.classList.add('d-flex')
        }
        el.classList.add('notranslate')
        if (name in legacyIcons) {
          renderLegacyIcon(el, name)
        } else {
          renderIcon(el, name)
        }
      }
    }
  })

  observe('[data-icon]', {
    add (el) {
      const symbol = el.getAttribute('data-icon')
      el.classList.add('notranslate')
      if (symbol in legacyIcons) {
        renderLegacyIcon(el, symbol)
      } else {
        renderIcon(el, symbol)
      }
    }
  })
}

function renderIcon (el, symbolOrAlias) {
  const symbol = aliases[symbolOrAlias] || symbolOrAlias
  el.classList.add('notranslate')
  el.innerHTML = ''
  const icon = document.createElement('sfgov-icon')
  icon.setAttribute('symbol', symbol)
  for (const attr in ['data-width', 'data-height']) {
    if (el.hasAttribute(attr)) {
      icon.setAttribute(attr.replace('data-', ''), el.getAttribute(attr))
      el.removeAttribute(attr)
    }
  }
  return el.append(icon)
}

function renderLegacyIcon (el, symbolOrAlias) {
  const symbol = aliases[symbolOrAlias] || symbolOrAlias
  const iconSvg = legacyIcons[symbol]
  if (iconSvg) {
    el.innerHTML = iconSvg
    // XXX: why not querySelector('svg') here?
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
