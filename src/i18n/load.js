import { I18NEXT_DEFAULT_NAMESPACE } from '../constants'
import { getJSON } from '../utils'

const { FormioUtils } = window

export function loadTranslations (url) {
  return getJSON(url, {}, { method: 'GET' })
    .then(res => {
      if (res.status === 'success') {
        return res.data
      } else {
        throw new Error(`Translation load error: ${JSON.stringify(res)}`)
      }
    })
}

export function loadEmbeddedTranslations (model, i18next) {
  const bundles = getEmbeddedTranslations(model)
  for (const lang in bundles) {
    i18next.addResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE, bundles[lang])
  }
}

export function getEmbeddedTranslations (model) {
  const bundles = {}
  FormioUtils.eachComponent(model.components, comp => {
    const { key, properties } = comp
    if (properties) {
      for (const prop in properties) {
        if (/^[-a-z]+:/i.test(prop)) {
          const [lang, field] = prop.split(':')
          const stringId = `${key}.${field}`
          const value = properties[prop]
          if (bundles[lang]) {
            bundles[lang][stringId] = value
          } else {
            bundles[lang] = { [stringId]: value }
          }
        }
      }
    }
  }, true)
  return bundles
}
