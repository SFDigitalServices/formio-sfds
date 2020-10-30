const {
  VERCEL_GITHUB_COMMIT_REF: branch = 'main'
} = process.env

module.exports = {
  pkg: require('../package.json'),
  debug: process.env.NODE_ENV === 'test',
  env: process.env,
  git: {
    branch
  }
}
