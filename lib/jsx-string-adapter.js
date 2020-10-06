import { html } from 'jsx-pragmatic/dist/module/renderers/html'

export { node as h, Fragment } from 'jsx-pragmatic/dist/module/node'

export const renderer = html()

export function template (f) {
  return (...args) => f(...args).render(renderer)
}
