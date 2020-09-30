export default (options = {}) => {
  return {
    name: 'transform-vdo',

    transform (code, id) {
      if (id.endsWith('.jsx')) {
        const transformed = `
          /** @jsx h */
          /** @jsxFrag vdo */
          import vdo from 'vdo'
          const { createElement: h } = vdo
          ${code.replace("import vdo from 'vdo'", '')}
        `
        return {
          code: transformed
        }
      }
    }
  }
}
