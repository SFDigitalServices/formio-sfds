const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')
const { Router } = require('express')

// one day
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000
const FORM_URL = 'https://sf.gov/feedback'

let cached

module.exports = Router()
  .get('/forms.css', async (req, res) => {
    res.set('content-type', 'text/css')

    if (!cached || (Date.now() - cached.timestamp) > CACHE_TIMEOUT) {
      const body = await fetch(FORM_URL).then(res => res.text())
      const { document } = new JSDOM(body).window

      const imports = [...document.querySelectorAll('link[rel="stylesheet"]')]
        .map(link => atImport(link.href))
      const styles = [...document.querySelectorAll('style')]
        .map(style => style.textContent)
        .filter(css => css && !css.includes('<!--'))
        .map(css => css.replace(/\/\*#(.*?)\*\//g, ''))

      const content = [
        `/* generated from ${FORM_URL} @ ${new Date()} */`,
        '',
        ...imports,
        '',
        ...styles
      ].join('\n')

      cached = {
        timestamp: Date.now(),
        content
      }
      res.send(content)
    } else {
      res.send(cached.content)
    }
  })

function atImport (href, base = FORM_URL) {
  let url = href
  if (url.startsWith('//')) {
    url = `https:${url}`
  } else if (url.startsWith('/')) {
    const baseURL = new URL(base)
    baseURL.pathname = href
    url = String(baseURL)
  }
  return `@import url('${url}');`
}
