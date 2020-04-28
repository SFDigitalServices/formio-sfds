import getJSON from './getJSON'

export { getJSON, mergeObjects }

function mergeObjects (a, ...rest) {
  for (const b of rest) {
    if (!b) continue
    for (const [key, value] of Object.entries(b)) {
      if (a[key] instanceof Object && value instanceof Object) {
        a[key] = mergeObjects(a[key], value)
      } else {
        a[key] = value
      }
    }
  }
  return a
}
