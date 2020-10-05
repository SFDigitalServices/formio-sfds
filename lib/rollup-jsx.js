export default (options = {}) => ({
  name: 'jsx',

  transform (code, id) {
    if (id.endsWith('.jsx')) {
      if (code.includes('export function render ')) {
        return `
          /** @jsx node */
          /** @jsxFrag Fragment */
          import { node, Fragment } from 'jsx-pragmatic/dist/module/node'
          import { html } from 'jsx-pragmatic/dist/module/renderers/html'

          ${code}

          export default (...args) => render(...args).render(html())
        `
      } else {
        throw new Error('JSX files must export a "render" function')
      }
    }
  }
})
