const fetch = require('node-fetch')
const { URL } = require('url')
const { join } = require('path')
const nunjucks = require('nunjucks')
const Phrase = require('../src/phrase')
const { Proxy } = require('../lib/proxy')
const defaultData = require('../views/data')

const {
  FORMS_API_URL = 'https://sfgov-forms.vercel.app'
} = process.env

const templates = nunjucks.configure(join(__dirname, '../views'), {
  autoescape: false
})

const languageNames = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  'zh-hant': 'Chinese (Traditional)',
  'zh-hans': 'Chinese (Simplified)',
  'zh-tw': 'Chinese (Taiwan)',
  fil: 'Filipino',
  tl: 'Tagalog'
}

module.exports = async (req, res) => {
  const { query } = req
  const { url } = query

  const allPages = await getSFGovPages()
  const uniques = new Set()
  const uniquePages = allPages
    .filter(node => {
      if (uniques.has(node.url)) {
        return false
      } else {
        uniques.add(node.url)
        return true
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  const data = Object.assign({
    query,
    pages: uniquePages,
    sfgov: {},
    formio: {},
    formiojs: {},
    theme: {},
    translation: {},
    warnings: []
  }, defaultData)

  if (url) {
    const parsed = new URL(url)

    if (isSFGovURL(parsed)) {
      await getSFgovData(url, data)
    } else if (isFormioPortalURL(parsed)) {
      const parts = parsed.hash.replace(/^#\//, '').split('/')
      if (parts[0] === 'project' && parts[2] === 'form' && parts[3]) {
        const formId = parts[3]
        const [form] = await fetch(`http://sfds.form.io/form?_id__eq=${formId}`).then(res => res.json())
        if (form) {
          data.formio.form = form
          data.formio.url = `https://sfds.form.io/${form.path}`
        } else {
          data.error = `Unable to find form with ID: "${formId}"`
        }
      }
    } else if (isDataSourceURL(parsed)) {
      data.formio.url = url
      data.formio.form = await fetch(url).then(res => res.json())
    }

    const { form } = data.formio
    if (form) {
      const phrase = new Phrase(form)
      const info = phrase.getTranslationInfo()
      if (info && info.url) {
        data.translation.url = info.url
        data.translation.source = {
          title: `Phrase project <code>${info.projectId}</code>`
        }
      }

      if (!data.sfgov.url) {
        const dataSourceURL = data.formio.url
        console.warn('Looking up sf.gov page by form URL:', dataSourceURL)

        const pages = uniquePages.filter(d => {
          const url = d.field_formio_data_source
          console.warn('  ?', url)
          return url === dataSourceURL
        })
        if (pages.length >= 1) {
          const [page] = pages
          data.sfgov.url = page.url
          data.sfgov.title = page.title
          await getSFgovData(page.url, data)
          if (pages.length > 1) {
            data.warnings.push(`
              Multiple pages on sf.gov were found with this data source URL:
              <ul>
                ${pages.map(page => `
                  <li>
                    <b>${page.title}</b>
                    (<a href="${page.url}"><code>${new URL(page.url).pathname}</code></a>)
                  </li>
                `).join('')}
              </ul>
            `)
          }
        } else if (pages.length === 0) {
          data.error = `No sf.gov form pages were found with data source URL: "${dataSourceURL}"`
        }
      }
    }
  } else {
    // data.error = 'Please enter a URL from sf.gov or form.io'
  }

  res.setHeader('Content-Type', 'text/html')
  const content = templates.render('wtf.html', data)
  res.send(content)
}

function isSFGovURL (url) {
  return url.hostname === 'sf.gov' || (
    url.hostname.includes('sfgov') &&
    url.hostname.endsWith('.pantheonsite.io')
  )
}

function isFormioPortalURL (url) {
  return url.hostname === 'portal.form.io'
}

function isDataSourceURL (url) {
  return url.hostname.endsWith('.form.io') &&
    url.hostname.includes('sfds')
}

function getUnpkgVersion (url) {
  const match = url.match(/@([^/]+)/)
  return match ? match[1] : undefined
}

async function getSFgovData (url, data) {
  const proxy = new Proxy({ base: url })
  const { body, document } = await proxy.fetch('')
  data.body = body

  data.sfgov.url = url
  data.sfgov.title = document.title.replace(/\s*\|\s*San Francisco\s*$/, '')

  const { lang } = document.documentElement
  data.lang = {
    code: lang,
    name: languageNames[lang.toLowerCase()],
    links: Array.from(document.querySelectorAll('link[rel="alternate"]'), link => {
      const code = link.hreflang
      return {
        href: link.href,
        lang: {
          code,
          name: languageNames[code]
        }
      }
    })
      .filter(link => link.lang.code !== lang)
  }

  const element = document.querySelector('[data-source]')
  if (element) {
    data.formio.url = element.getAttribute('data-source')
    const form = await fetch(data.formio.url).then(res => res.json())
    data.formio.form = form

    if (element.hasAttribute('data-options')) {
      const options = JSON.parse(element.getAttribute('data-options'))
      data.formio.options = options

      if (typeof options.i18n === 'string') {
        data.translation.url = options.i18n
        const match = options.i18n.match(/google\/([^@]+)/)
        data.translation.source = {
          title: 'Google Sheets',
          url: `https://docs.google.com/spreadsheets/d/${match[1]}/edit`
        }
      }
    }
  }

  const formioScript = proxy.getScript('formiojs')
  if (formioScript) {
    data.formiojs.url = formioScript.src
    data.formiojs.version = getUnpkgVersion(formioScript.src)
  }

  const themeScript = proxy.getScript('formio-sfds')
  if (themeScript) {
    data.theme.url = themeScript.src
    data.theme.version = getUnpkgVersion(themeScript.src)
  }
}

async function getSFGovPages (options) {
  const { data } = await fetch(`${FORMS_API_URL}/api/sfgov`)
    .then(res => res.json())
  return (data && data.forms) || []
}
