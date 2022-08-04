import htm from 'htm'
import vhtml from 'vhtml'

export { htm, vhtml }

const _html = htm.bind(vhtml)

/**
 * htm + vhtml sometimes renders _arrays_ of strings, so we have
 * to join them together before returning them.
 *
 * @param  {...any} args
 * @returns {string}
 */
export const html = (...args) => stringify(_html(...args))

export function attrMap (componentAttrs) {
  return Object.fromEntries(
    componentAttrs.map(a => [a.attr, a.value])
  )
}

/**
 * @param {any} condition
 * @param {string | (any => string)} output
 * @returns
 */
export function If (condition, output) {
  const render = (typeof output === 'function')
    ? output.bind(null, condition)
    : () => output
  return (!!condition && render()) || ''
}

/**
 * @param {string | string[]} value
 * @returns {string}
 */
export function stringify (value) {
  return Array.isArray(value)
    ? value.flatMap(stringify).join('')
    : value
}

export function omit (obj, ...keys) {
  const copy = { ...obj }
  for (const key of keys) delete copy[key]
  return copy
}
