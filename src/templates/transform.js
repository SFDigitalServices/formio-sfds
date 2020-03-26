const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const classes = {
  'button-sm': ''
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
    .join(' ')
}
