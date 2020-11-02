import interpolate from 'interpolate'

const I18NEXT_DEFAULT_NAMESPACE = 'translation' // ???
const I18N_SERVICE_URL = process.env.I18N_SERVICE_URL || 'https://translate.sf.gov'
const debugDefault = process.env.NODE_ENV !== 'test'

export { I18N_SERVICE_URL, I18NEXT_DEFAULT_NAMESPACE }

export default class Phrase {
  static get configDefaults () {
    return {
      prefix: '[[__',
      suffix: '__]]',
      autoLowercase: false,
      debugMode: true
    }
  }

  constructor (form, config = {}) {
    this.form = form
    this.config = { ...Phrase.configDefaults, ...config }
    this.reverseLookup = new Map()
    this.loaded = false
  }

  get editorEnabled () {
    return window.PHRASEAPP_ENABLED || false
  }

  enableEditor () {
    window.PHRASEAPP_ENABLED = true
    window.PHRASEAPP_CONFIG = this.config
    this.backupT = this.form.i18next.t
    this.form.i18next.t = this.t.bind(this)
    this.script = document.createElement('script')
    this.script.src = `https://app.phrase.com/assets/in-context-editor/2.0/app.js?${Date.now()}`
    this.style = document.createElement('style')
    this.style.textContent = this.css
    document.body.appendChild(this.script)
    document.body.appendChild(this.style)
  }

  disableEditor () {
    window.PHRASEAPP_ENABLED = false
    window.PHRASEAPP_CONFIG = {}
    if (this.backupT) {
      this.form.i18next.t = this.backupT
    }
    if (this.script) {
      this.script.remove()
      this.style.remove()
      delete this.script
      delete this.style
    }
  }

  formatKey (keys, options = {}) {
    const multiple = Array.isArray(keys) && keys.length > 1
    const fallback = multiple ? keys[keys.length - 1] : ''
    if (multiple && !fallback) {
      return ''
    }

    const { prefix, suffix } = this.config
    let key = multiple ? keys[0] : keys
    const { context, contextSeparator = '._.' } = options || {}
    if (context) {
      key = `${key}${contextSeparator}${context}`
    }
    return `${prefix}phrase_${key}${suffix}`
  }

  t (keys, options) {
    const value = Array.isArray(keys) ? keys[keys.length - 1] : keys

    if (value && this.reverseLookup.has(value)) {
      const key = this.reverseLookup.get(value)
      return this.formatKey(key, options)
    }

    return this.formatKey(keys, options)
  }

  get props () {
    const { form } = this
    const props = Object.assign(
      {},
      form.properties || form.form.properties,
      form.options
    )
    const {
      phraseProjectId,
      phraseProjectVersion,
      i18nServiceUrl
    } = props
    return { phraseProjectId, phraseProjectVersion, i18nServiceUrl }
  }

  getTranslationInfo () {
    const { props } = this
    const { phraseProjectId, phraseProjectVersion, i18nServiceUrl } = props

    if (phraseProjectId) {
      const serviceUrl = i18nServiceUrl || I18N_SERVICE_URL
      let url = interpolate(serviceUrl, props)
      // only append the projectId if it's not in the URL already
      if (!url.includes(phraseProjectId)) {
        url = `${url}/phrase/${phraseProjectId}`
      }
      // also only append the version if it's not in it already
      if (phraseProjectVersion && !url.includes(phraseProjectVersion)) {
        url = `${url}@${phraseProjectVersion}`
      }
      return {
        projectId: phraseProjectId,
        version: phraseProjectVersion,
        url
      }
    } else if (i18nServiceUrl) {
      return {
        url: interpolate(i18nServiceUrl, props)
      }
    }

    return undefined
  }

  async load (loadTranslations) {
    const { form, reverseLookup } = this
    const { i18next, options: { debug = debugDefault } } = form
    const info = this.getTranslationInfo()
    if (info) {
      const { url, projectId } = info

      // this gets passed to window.PHRASEAPP_CONFIG,
      // which is how Phrase knows which project to load
      this.config.projectId = projectId

      if (debug) console.warn('Loading translations from:', url)

      const resourcesByLanguage = await loadTranslations(url) || {}

      this.loaded = {
        url,
        projectId,
        resourcesByLanguage
      }

      if (debug) console.warn('Loaded resources:', resourcesByLanguage)

      for (const [lang, resources] of Object.entries(resourcesByLanguage)) {
        i18next.addResourceBundle(lang, I18NEXT_DEFAULT_NAMESPACE, resources)
        if (lang === 'en') {
          for (const [key, value] of Object.entries(resources)) {
            if (reverseLookup.has(value)) {
              if (debug) {
                console.warn(
                  'Duplicate string for reverse lookup of "%s": "%s" and "%s"',
                  value, reverseLookup.get(value), key
                )
              }
            }
            if (debug) console.warn('reverse lookup: "%s" -> "%s"', value, key)
            reverseLookup.set(value, key)
          }
        }
      }

      return Object.assign(info, { resourcesByLanguage })
    } else {
      return false
    }
  }
}
