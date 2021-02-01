import { Proxy } from '../lib/proxy'

module.exports = async (req, res) => {
  const { query } = req
  const { path = '/feedback' } = query

  try {
    const proxy = new Proxy(query)
    await proxy.fetch(query.url || path)
    proxy.transform(query)
    proxy.appendScript(`
      window.setLanguage = function (lang) {
        for (var id in Formio.forms) {
          var form = Formio.forms[id]
          form.language = lang
          form.redraw()
        }
      }

      var links = document.querySelectorAll('a[data-sfgov-translate]')
      Array.from(links).forEach(function (link) {
        var lang = link
          .getAttribute('data-sfgov-translate')
          .split('|')
          .pop()
        link.addEventListener('click', function (event) {
          window.setLanguage(lang)
          event.preventDefault()
        })
      })

      // disable the google translate links
      // (do this last so that if we ever get rid of jQuery it won't
      // short-circuit the rest of the function)
      $('.gtranslate-link').off()
    `)
    proxy.send(res)
  } catch (error) {
    res.statusCode = 500
    res.end(`Sorry, there was an error: <pre>${error.message}</pre>`)
  }
}
