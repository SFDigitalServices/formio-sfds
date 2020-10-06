const VIRTUAL_RENDER_ID = 'jsx-string-template'

export default (options = {}) => ({
  name: VIRTUAL_RENDER_ID,

  resolveId (id) {
    if (id === VIRTUAL_RENDER_ID) {
      return './lib/jsx-string-adapter.js'
    }
  },

  transform (code, id) {
    if (id.endsWith('.jsx')) {
      return `
/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from '${VIRTUAL_RENDER_ID}'

${code}`
    }
  }
})
