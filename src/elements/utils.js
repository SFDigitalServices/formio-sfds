export {
  tryParse,
  fallbackCSS
}

function tryParse (str, defaultValue = {}) {
  if (!str) {
    return defaultValue
  }

  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('Unable to parse:', str, error)
    return defaultValue
  }
}

function fallbackCSS (el, property, value) {
  if (!el.style.getPropertyValue(property)) {
    el.style.setProperty(property, value)
  }
}

