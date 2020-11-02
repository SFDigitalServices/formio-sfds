const remark = require('remark')
const remarkHTML = require('remark-html')
const remarkFrontmatter = require('remark-frontmatter')
const remarkGitHub = require('remark-github')
const remarkGFM = require('remark-gfm')
const remarkAutolinkHeaders = require('remark-autolink-headings')
const remarkSlug = require('remark-slug')
const remarkHighlight = require('remark-highlight.js')
const h = require('hastscript')
const visit = require('unist-util-visit')

const {
  VERCEL_URL: deploymentURL
} = process.env

module.exports = data => remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGitHub)
  .use(remarkGFM)
  .use(remarkHTML)
  .use(options => tree => {
    // increase level of all headings
    visit(tree, 'heading', node => { node.depth += 1 })

    // update link URLs
    visit(tree, 'link', node => {
      const gitURL = `https://github.com/SFDigitalServices/formio-sfds/tree/${data.git.ref}`
      const oldURL = node.url
      if (node.url.startsWith('docs/')) {
        node.url = node.url.replace(/^docs\//, '')
      }
      node.url = node.url
        .replace('.md', '/')
        .replace('../src', `${gitURL}/src`)
        .replace(/#readme$/, '')
      if (deploymentURL) {
        node.url = node.url
          .replace('formio-sfds.vercel.app', deploymentURL)
      } else {
        node.url = node.url
          .replace('https://formio-sfds.vercel.app', '')
        if (!node.url) {
          node.url = '/'
        }
      }
      if (node.url !== oldURL) {
        console.log('  link change: %s → %s', oldURL, node.url)
      }
    })
  })
  .use(remarkSlug)
  .use(remarkAutolinkHeaders, {
    content: h('span.pr-1.fg-grey-4', '#')
  })
  .use(remarkHighlight)
