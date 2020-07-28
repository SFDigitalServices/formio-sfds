export default {
  enable (config) {
    window.PHRASEAPP_ENABLED = true
    window.PHRASEAPP_CONFIG = config
    this.script = document.createElement('script')
    this.script.src = `https://app.phrase.com/assets/in-context-editor/2.0/app.js?${Date.now()}`
    document.body.appendChild(this.script)
  },
  disable () {
    window.PHRASEAPP_ENABLED = false
    window.PHRASEAPP_CONFIG = {}
    this.script.remove()
    delete this.script
  }
}
