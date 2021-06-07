const { Router } = require('express')

module.exports = Router()
  .get('/preview', require('./preview'))
  .get('/strings', require('./strings'))
  .get('/translate', require('./translate'))
  .get('/wtf', require('./wtf'))
