const fetch = require('node-fetch')
const { URL } = require('url')
const { JSDOM } = require('jsdom')
const { readFileSync } = require('fs')

const LIVE_URL = 'https://sf.gov'

const envUrls = {
  test: 'https://test-sfgov.pantheonsite.io'
}

const scriptSource = readFileSync(require.resolve('../dist/formio-sfds.standalone.js'), 'utf8')
const banner = '/** injected by formio-sfds proxy */'
const footer = banner

module.exports = (req, res) => {
  const { host, protocol = 'https', url } = req
  const proxyUrl = new URL(`${protocol}://${host}${url}`)

  const {
    form: source,
    options,
    version,
    env
  } = req.query

  res.setHeader('Content-Type', 'text/html')

  const baseUrl = (env ? envUrls[env] : null) || LIVE_URL
  const fetchUrl = `${baseUrl}/feedback`

  fetch(fetchUrl)
    .then(fetched => fetched.text())
    .then(body => {
      const dom = new JSDOM(body)
      const { document } = dom.window

      const script = document.querySelector('script[src*=formio-sfds]')
      if (script) {
        if (version) {
          script.setAttribute('src', script.src.replace(/formio-sfds@[^/]+/, `formio-sfds@${version}`))
        } else {
          script.removeAttribute('src')
          script.textContent = `${banner}${scriptSource}${footer}`
        }
      } else {
        console.warn(
          'no formio-sfds <script> found in:',
          Array.from(document.querySelectorAll('script')).map(el => el.src)
        )
      }

      const div = document.querySelector('[data-source]')
      if (div) {
        if (source) {
          div.setAttribute('data-source', source)
        }
        if (options) {
          div.setAttribute('data-options', options)
        }
        const header = document.createElement('div')
        header.classList.add('formio-sfds')
        header.innerHTML = `
          <details>
            <summary class="m-0">⚠️ This is a preview of your form</summary>
            <div class="bg-red-1 p-2 border-1 border-bright-blue round-bottom-1">
              <p class="mt-0 mb-1">
                You are viewing this form in a simulated sf.gov environment.
                The form should function as expected, and styles should reflect
                what you will see when this version of <code>formio-sfds</code>
                is used on sf.gov. Some additional information is listed below.
              </p>
              <ul class="m-0 pl-2">
                <li><b>This URL</b>: <a href="${proxyUrl}"><code>${proxyUrl}</code></a></li>
                <li><b>Fetched URL</b>: <a href="${fetchUrl}"><code>${fetchUrl}</code></a></li>
                <li><b>Form URL</b>: ${
                  source ? `<a href="${source}"><code>${source}</code></a>` : 'not provided'
                } ${
                  env ? `(via env "${env}")` : ''
                }</li>
                <li><b>formio-sfds version</b>: ${
                  version ? `<code>${version}</code>` : 'not provided (injected built JS)'
                }</li>
              </ul>
            </div>
          </details>
        `.trim()
        div.parentNode.insertBefore(header, div)
      } else {
        console.warn('no [data-source] form element found!')
      }

      const base = document.createElement('base')
      base.setAttribute('href', baseUrl)
      document.head.insertBefore(base, document.head.firstChild)

      const html = dom.serialize()
      res.setHeader('Content-Length', Buffer.byteLength(html))
      res.end(html, 'utf8')
    })
    .catch(error => {
      res.statusCode = 500
      res.end(`Sorry, there was an error: <pre>${error.message}</pre>`)
    })
}
