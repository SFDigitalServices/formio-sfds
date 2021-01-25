import { Proxy } from '../lib/proxy'

module.exports = async (req, res) => {
  const { query } = req
  const { path = '/feedback' } = query

  try {
    const proxy = new Proxy(query)
    await proxy.fetch(query.url || path)
    proxy.transform(query)
    proxy.send(res)
  } catch (error) {
    res.statusCode = 500
    res.end(`Sorry, there was an error: <pre>${error.message}</pre>`)
  }
}
