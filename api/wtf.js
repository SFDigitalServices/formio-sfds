import fetch from 'node-fetch'
import { URL } from 'url'
import { join } from 'path'
import nunjucks from 'nunjucks'
import Phrase from '../src/phrase'
import { Proxy } from '../lib/proxy'

const templates = nunjucks.configure(join(__dirname, '../views'), {
  autoescape: false
})

module.exports = async (req, res) => {
  const { query } = req
  const { url } = query

  const data = {
    input: query,
    sfgov: {},
    formio: {},
    formiojs: {},
    theme: {},
    translation: {}
  }

  if (url) {
    const parsed = new URL(url)

    if (isSFGovURL(parsed)) {
      data.sfgov.url = url

      const proxy = new Proxy({ base: url })
      const { document } = await proxy.fetch(parsed.path)
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
            const match = options.i18n.match(/google\/([^@])/)
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
          title: `Phrase project ${info.projectId}`,
          url: '' // TODO
        }
      }
    }
  } else {
    data.error = 'Please enter a URL from sf.gov or form.io'
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
