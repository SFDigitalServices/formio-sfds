const classes = {
  'sfgov-button': ''
}

export default function (type, value) {
  if (!value) {
    return value
  }

  if (type === 'class') {
    return transformClasses(value)
  }
  return value
}

function transformClasses (value) {
  const tokens = String(value).trim().split(/ +/)
  return tokens
    .map(token => has(classes, token) ? classes[token] : token)
    .filter(notEmptyUnique)
    .join(' ')
}

function has (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function notEmptyUnique (value, index, list) {
  return value && list.indexOf(value) === index
}
