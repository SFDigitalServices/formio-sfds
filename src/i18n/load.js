import dot from 'dotmap'
import { I18NEXT_DEFAULT_NAMESPACE } from '../constants'

const { FormioUtils } = window

export function loadEmbeddedTranslations (form) {
  const { component, i18next } = form
  const bundles = getEmbeddedTranslations(component)
  for (const lang in bundles) {
    i18next.addResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE, bundles[lang])
  }
}

export function getEmbeddedTranslations (form) {
  const bundles = {}
  FormioUtils.eachComponent(form.components, comp => {
    if (!comp.properties) return

    for (const prop in comp.properties) {
      const value = comp.properties[prop]
      if (/^[-a-z]+:/i.test(prop)) {
        const [lang, path] = prop.split(':')
        const english = dot.get(comp, path)
        if (english && typeof english === 'string') {
          if (!bundles[lang]) bundles[lang] = {}
          // console.log('%s: %s "%s" -> "%s', lang, path, english, value)
          bundles[lang][english] = value
        } else {
          // console.warn('%s: %s (no english)', lang, path, english)
        }
      }
    }
  }, true)
  if (Object.keys(bundles).length) {
    // console.info('found embedded translations:', bundles)
  }
  return bundles
}

export function addReverseLookups (form, languages = ['es', 'fil', 'zh']) {
  const { i18next } = form
  const englishBundle = i18next.getResourceBundle('en', I18NEXT_DEFAULT_NAMESPACE)
  if (!englishBundle) {
    return false
  }

  const englishStrings = Object.entries(englishBundle)
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
  return true
}
