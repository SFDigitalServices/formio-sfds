export default (options = {}) => ({
  name: 'jsx',

  transform (code, id) {
    if (id.endsWith('.jsx')) {
      if (code.includes('export function render ')) {
        return `
          /** @jsx node */
          /** @jsxFrag Fragment */
          import { node, Fragment } from 'jsx-pragmatic/dist/module/node'
          import $render from 'jsx-pragmatic/dist/module/renderers/html'

          ${code}

          export default function $render(...args) {
            return render(...args).render($html())
          }
        `
      } else {
        throw new Error('JSX files must export a "render" function')
      }
    }
  }
})
