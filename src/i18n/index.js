import preval from 'babel-plugin-preval/macro'

const translations = preval`
  const langs = ['en', 'es', 'tl', 'zh']
  for (const lang of langs) {
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
