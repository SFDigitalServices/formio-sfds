import preval from 'babel-plugin-preval/macro'

const translations = preval`
  /**
   * This code is evaluated at build time and results in a smaller browser
   * bundle. It also prevents empty translations from making it into forms,
   * since empty strings are treated as valid by default.
   */
  const langs = ['en', 'es', 'tl', 'zh']
  for (const lang of langs) {
    // export each language code as an object without empty ("") values
    module.exports[lang] = removeEmptyEntries(require('./' + lang + '.json'))
  }

  function removeEmptyEntries (obj) {
    const copy = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== '') {
        copy[key] = value
      }
    }
    return copy
  }
`

export default translations
