const express = require('express')

const { PORT = 4001 } = process.env

const app = express()

app
  .use('/api', require('./api'))
  .use('/dist', express.static('dist', {
  }))
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
