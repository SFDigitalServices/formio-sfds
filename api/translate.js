import { Proxy } from '../lib/proxy'

module.exports = async (req, res) => {
  const { query } = req
  const { path = '/feedback' } = query
  let { options } = query

  try {
    options = Object.assign(
      {
        translate: true,
        disableConditionals: true,
        unlockNavigation: true
      },
      options ? JSON.parse(options) : null
    )
    query.options = JSON.stringify(options)

    const proxy = new Proxy(query)
    const { document } = await proxy.fetch(query.url || path)

    document.head.appendChild(
      proxy.element('script', {}, `
        window.drupalSettings = { user: { uid: 1 } }
      `)
    )

    proxy.transform(query)

    proxy.send(res)
  } catch (error) {
    res.statusCode = 500
    res.end(`Sorry, there was an error: <pre>${error.message}</pre>`)
  }
}
