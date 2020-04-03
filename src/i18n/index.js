import translations from './translations.tsv'

const i18n = {}
for (const { String: name, en, ...locales } of translations) {
  for (const [locale, value] of Object.entries(locales)) {
    if (value) {
      if (!(locale in i18n)) i18n[locale] = {}
      if (name) i18n[locale][name] = value
      i18n[locale][en] = value
    }
  }
}

console.warn('formio-sfds i18n:', i18n)

export default i18n
