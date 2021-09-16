import dot from 'dot-component'
import { I18NEXT_DEFAULT_NAMESPACE } from '../constants'

const { FormioUtils } = window

export function loadEmbeddedTranslations (form) {
  const { component, i18next } = form
  const bundles = getEmbeddedTranslations(component)
  for (const lang in bundles) {
    i18next.addResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE, bundles[lang])
  }
}

export function getEmbeddedTranslations (component) {
  const bundles = {}
  FormioUtils.eachComponent(component.components, comp => {
    const { key, properties } = comp
    if (properties instanceof Object) {
      for (const prop in properties) {
        const value = properties[prop]
        if (/^[-a-z]+:/i.test(prop)) {
          const [lang, field] = prop.split(':')
          const stringId = `${key}.${field}`
          if (!bundles[lang]) bundles[lang] = {}
          bundles[lang][stringId] = value
        }
      }
    }
  }, true)
  if (Object.keys(bundles).length) {
    console.info('found embedded translations:', bundles)
  }
  return bundles
}

export function addReverseLookups (form, languages = ['es', 'fil', 'zh']) {
  const { i18next } = form
  const englishStrings = Object.entries(
    i18next.getResourceBundle('en', I18NEXT_DEFAULT_NAMESPACE)
  )
    .filter(([key, value]) => key !== value)
  for (const lang of languages) {
    const current = i18next.getResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE) || {}
    const bundle = {}

    for (const [key, english] of englishStrings) {
      if (typeof english === 'string' && !current[english]) {
        bundle[english] = `$t(${key})`
      }
    }
    i18next.addResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE, bundle)
  }
}
