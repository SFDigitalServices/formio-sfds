import interpolate from 'interpolate'

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
    const multiple = Array.isArray(keyOrKeys) && keyOrKeys.length > 1

    /*
     * The pattern we're looking for here is:
     *
     * ```js
     * ctx.t([`${component.key}.label`, component.label])
     * ```
     *        ↑                         ↑
     *        key name in Phrase        English translation
     *
     * If we get an array like this and the English text is empty,
     * then it probably doesn't need to be translated and we shouldn't
     * show a placeholder for it.
     */
    const english = multiple ? keyOrKeys[keyOrKeys.length - 1] : ''
    if (multiple && !english) {
      // we need to return a "truthy" string here, otherwise form.io
      // will use the key provided as a fallback
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

  getTranslationInfo (form) {
    const props = Object.assign({}, form.form.properties, form.options)
    const {
      phraseProjectId,
      phraseProjectVersion,
      i18nServiceUrl
    } = props

    if (phraseProjectId) {
      const serviceUrl = i18nServiceUrl || I18N_SERVICE_URL
      let url = interpolate(serviceUrl, props)
      // only append the projectId if it's not in the URL already
      if (!url.includes(phraseProjectId)) {
        url = `${serviceUrl}/phrase/${phraseProjectId}`
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
}
