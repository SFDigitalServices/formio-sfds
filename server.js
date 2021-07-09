const express = require('express')

const { PORT } = process.env

const app = express()

app
  .use('/api', require('./api'))
  .use('/sfgov', require('./lib/sfgov'))
  /*
   * FIXME: because of how views are built right now, we have to serve /dist
   * from both / *and* /dist.
   */
  .use('/dist', express.static('dist'))
  // ...but we really only need to serve HTML from /
  .use('/', express.static('dist', {
    extensions: ['html']
  }))
  .use((req, res, next) => {
    console.error('404:', req.originalUrl)
    res.set('Content-type', 'text/plain')
    res.status(404).send(`404: "${req.path}"`)
  })

const server = app.listen(PORT, () => {
  const { address, port } = server.address()
  console.log('server listening at %s:%s', address === '::' ? 'localhost' : address, port)
})
