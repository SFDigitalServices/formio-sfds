import { html } from 'jsx-pragmatic'

// create one HTML renderer
export const renderer = html()

/**
 * This is a decorator that wraps a JSX component function with a call to the
 * jsx-pragmatic render() method with the singular HTML renderer (above).
 *
 * ```js
 * import { stringRenderer } from 'path/to/render'
 * export default stringRenderer(MyComponent)
 * export function MyComponent (props) {
 *   return <div {...props} />
 * }
 * ```
 *
 * @param {Function} component The component rendering function
 * @returns {Function}
 */
export function stringRenderer (component) {
  return (...args) => component(...args)?.render(renderer)
}
