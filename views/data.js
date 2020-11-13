const {
  NODE_ENV,
  VERCEL_URL,
  VERCEL_GITHUB_COMMIT_REF = 'main',
  VERCEL_GITHUB_COMMIT_SHA,
  VERCEL_GITHUB_COMMIT_AUTHOR_LOGIN,
  VERCEL_GITHUB_COMMIT_AUTHOR_NAME
} = process.env

module.exports = {
  pkg: require('../package.json'),
  debug: NODE_ENV === 'test',
  url: VERCEL_URL,
  git: {
    ref: VERCEL_GITHUB_COMMIT_REF,
    sha: VERCEL_GITHUB_COMMIT_SHA,
    author: {
      login: VERCEL_GITHUB_COMMIT_AUTHOR_LOGIN,
      name: VERCEL_GITHUB_COMMIT_AUTHOR_NAME
    }
  }
}
