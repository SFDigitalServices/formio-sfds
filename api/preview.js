const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')

const LIVE_URL = 'https://sf.gov'

const envUrls = {
  test: 'https://test-sfgov.pantheonsite.io'
}

module.exports = (req, res) => {
  const {
    form: source,
    options,
    version,
    env,
    path = '/feedback'
  } = req.query

  res.setHeader('Content-Type', 'text/html')

  const baseUrl = (env ? envUrls[env] : null) || LIVE_URL
  const fetchUrl = `${baseUrl}${path}`

  let start = Date.now()

  fetch(fetchUrl)
    .then(fetched => fetched.text())
    .then(body => {
      res.setHeader('x-proxy-fetch-time', `${Date.now() - start} ms`)
      start = Date.now()

      const dom = new JSDOM(body)
      const { document } = dom.window

      const script = document.querySelector('script[src*=formio-sfds]')
      if (script) {
        if (version) {
          script.setAttribute('src', script.src.replace(/formio-sfds@[^/]+/, `formio-sfds@${version}`))
        } else {
          script.removeAttribute('src')
          script.textContent = `
            var script = document.createElement('script')
            var baseUrl = [
              location.protocol, '/',
              location.hostname,
              location.port ? ':' + location.port : ''
            ].join('')
            script.src = baseUrl + '/dist/formio-sfds.standalone.js'
            console.info('injected formio-sfds:', script.src)
            document.body.appendChild(script)
            document.getElementById('formio-sfds-url').href = script.src
          `
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
            <summary class="m-0">⚠️ This is a form preview</summary>
            <div class="bg-blue-1 p-2 border-1 border-bright-blue round-bottom-1">
              <p class="mt-0 mb-1">
                <b>You are viewing this form in a simulated sf.gov environment.</b>
                The form should function as expected, and styles should reflect
                what you will see when this version of <code>formio-sfds</code>
                is used on sf.gov. Some additional information is listed below.
              </p>
              <dl class="m-0">
                <dt><b>Fetched URL</b></dt>
                <dd class="mb-1 ml-2">
                  <a href="${fetchUrl}"><code>${fetchUrl}</code></a>
                </dd>

                <dt><b>Form URL</b></dt>
                <dd class="mb-1 ml-2">${
                  source ? `<a href="${source}"><code>${source}</code></a>` : 'not provided'
                } ${
                  env ? `(via <code>env=${env}</code>)` : ''
                }</dd>

                <dt><b>Theme version</b></dt>
                <dd class="mb-0 ml-2">${
                  version ? `version <code>${version}</code>` : 'not provided (injected <a id="formio-sfds-url">built JS</a>)'
                }</dd>
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
      res.setHeader('x-proxy-render-time', `${Date.now() - start} ms`)
      res.setHeader('Content-Length', Buffer.byteLength(html))
      res.end(html, 'utf8')
    })
    .catch(error => {
      res.statusCode = 500
      res.end(`Sorry, there was an error: <pre>${error.message}</pre>`)
    })
}
