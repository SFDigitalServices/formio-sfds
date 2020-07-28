const { I18N_SERVICE_URL } = process.env

const configDefaults = {
  prefix: '[[__',
  suffix: '__]]',
  autoLowercase: false,
  debugMode: true
}

export default {
  css: `
    body { padding-bottom: 300px; }
  `,

  enableEditor (config = {}) {
    if (window.PHRASEAPP_ENABLED) {
      console.warn('The Phrase editor is already loaded with config:', window.PHRASEAPP_CONFIG)
      return false
    }

    window.PHRASEAPP_ENABLED = true
    window.PHRASEAPP_CONFIG = { ...configDefaults, ...config }

    this.script = document.createElement('script')
    this.script.src = `https://app.phrase.com/assets/in-context-editor/2.0/app.js?${Date.now()}`
    this.style = document.createElement('style')
    this.style.textContent = this.css
    document.body.appendChild(this.script)
    document.body.appendChild(this.style)
  },

  formatKey (keyOrKeys, options) {
    const multiple = Array.isArray(keyOrKeys)
    const fallback = multiple ? keyOrKeys[keyOrKeys.length - 1] : ''
    if (multiple && !fallback) {
      return ' '
    }
    const key = multiple ? keyOrKeys[0] : keyOrKeys
    const { prefix, suffix } = configDefaults
    return `${prefix}phrase_${key}${suffix}`
  },

  disableEditor () {
    window.PHRASEAPP_ENABLED = false
    window.PHRASEAPP_CONFIG = {}
    if (this.script) {
      this.script.remove()
      this.style.remove()
      delete this.script
      delete this.style
    }
  },

  getTranslationInfo (form, serviceUrl = I18N_SERVICE_URL) {
    const props = form.form.properties || {}
    const {
      phraseProjectId,
      phraseProjectVersion,
      i18nServiceUrl = form.options.i18nServiceUrl || serviceUrl
    } = props

    if (phraseProjectId) {
      let url = `${i18nServiceUrl}/phrase/${phraseProjectId}`
      if (phraseProjectVersion) {
        url = `${url}/${phraseProjectVersion}`
      }
      return {
        projectId: phraseProjectId,
        version: phraseProjectVersion,
        url
      }
    }

    return undefined
  }
}
