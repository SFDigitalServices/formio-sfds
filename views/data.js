const {
  NODE_ENV,
  SOURCE_VERSION = null,
  GIT_REF: ref = 'main',
  HEROKU_APP_NAME = 'formio-sfds',
  HEROKU_SLUG_COMMIT: sha,
  HEROKU_APP_URL = `https://${HEROKU_APP_NAME}.herokuapp.com`
} = process.env

module.exports = {
  pkg: require('../package.json'),
  debug: NODE_ENV === 'test',
  version: SOURCE_VERSION,
  url: HEROKU_APP_URL,
  git: {
    ref,
    sha,
    author: { }
  }
}
