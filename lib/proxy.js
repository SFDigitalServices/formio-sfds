import { URL } from 'url'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

export const LIVE_URL = 'https://sf.gov'

export const environments = {
  live: LIVE_URL,
  test: 'https://test-sfgov.pantheonsite.io'
}

export class Proxy {
  constructor (options) {
    const { env = 'live', base } = options || {}
    this.base = base || environments[env] || LIVE_URL
    this.options = options
  }

  fetch (uri) {
    const url = /^https?:/.test(uri)
      ? uri
      : new URL(uri, this.base)
    console.warn('fetching:', url)
    return fetch(url)
      .then(async res => {
        this.response = res
        this.url = url
        this.body = await res.text()
        this.dom = new JSDOM(this.body)
        this.document = this.dom.window.document
        const base = this.document.createElement('base')
        base.setAttribute('href', String(this.base))
        this.document.head.insertBefore(base, this.document.head.firstChild)
        return this
      })
  }

  transform (query) {
    const {
      version: formioSFDSVersion,
      formioVersion,
      env = 'live'
    } = query

    const {
      document,
      url
    } = this

    let {
      source,
      options
    } = query

    this.setFormioSFDSVersion(formioSFDSVersion)
    if (formioVersion) {
      this.setFormioJSVersion(formioVersion)
    }

    const div = document.querySelector('[data-source]')
    if (div) {
      if (source) {
        div.setAttribute('data-source', source)
      } else {
        source = div.getAttribute('data-source')
      }
      if (options) {
        const optstr = options instanceof Object ? JSON.stringify(options) : options
        div.setAttribute('data-options', optstr)
      } else {
        options = div.getAttribute('data-options')
      }

      const info = this.element('div', { class: 'formio-sfds' })
      info.innerHTML = `
        <details class="my-4">
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
                <a href="${url}"><code>${url}</code></a>
                ${env ? `(via <code>env=${env}</code>)` : ''}
              </dd>

              <dt><b>Theme version</b></dt>
              <dd class="mb-0 ml-2">${
                formioSFDSVersion ? `version <code>${formioSFDSVersion}</code>` : 'not provided (injected <a id="formio-sfds-url">built JS</a>)'
              }</dd>

              <dt><b>Form data source URL</b></dt>
              <dd class="mb-1 ml-2">${
                source ? `<a href="${source}"><code>${source}</code></a>` : 'not provided'
              }</dd>

              <dt><b>Form options</b></dt>
              <dd class="mb-1 ml-2">${
                options ? `<pre>${JSON.stringify(JSON.parse(options), null, 2)}</pre>` : 'none provided'
              }</dd>
            </ul>
          </div>
        </details>
      `.trim()

      div.parentNode.insertBefore(info, div)
    } else {
      console.warn('no [data-source] form element found!')
    }
  }

  getScript (srcPattern) {
    const selector = `script[src*="${srcPattern}"]`
    return this.document.querySelector(selector)
  }

  setFormioSFDSVersion (version) {
    const script = this.getScript('formio-sfds@')
    if (script) {
      if (version) {
        script.setAttribute('src', script.src.replace(/formio-sfds@[^/]+/, `formio-sfds@${version}`))
      } else {
        script.removeAttribute('src')
        script.textContent = `
          var script = document.createElement('script')
          var baseUrl = [
            location.protocol, '//', location.hostname,
            location.port ? ':' + location.port : ''
          ].join('')
          script.src = baseUrl + '/dist/formio-sfds.standalone.js'
          console.info('injected formio-sfds:', script.src)
          document.body.appendChild(script)
          document.getElementById('formio-sfds-url').href = script.src
        `
      }
    } else {
      throw new Error('No <script> found with formio-sfds in the src attribute')
    }
  }

  setFormioJSVersion (version) {
    const script = this.getScript('formiojs@')
    if (script) {
      script.setAttribute('src', script.src.replace(/formiojs@[^/]+/, `formio-sfds@${version}`))
    } else {
      throw new Error('No <script> found with formiojs in the src attribute')
    }
  }

  element (name, attrs = {}, children = []) {
    const el = this.document.createElement(name)
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value)
      }
    }
    if (typeof children === 'string') {
      el.innerHTML = children
    } else if (Array.isArray(children)) {
      for (const child of children) {
        el.appendChild(child)
      }
    }
    return el
  }

  send (res) {
    const html = this.dom.serialize()
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Length', Buffer.byteLength(html))
    res.end(html, 'utf8')
  }
}
