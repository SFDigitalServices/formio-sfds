const {
  NODE_ENV,
  VERCEL_URL,
  VERCEL_GITHUB_DEPLOYMENT,
  VERCEL_GITHUB_ORG,
  VERCEL_GITHUB_REPO,
  VERCEL_GITHUB_COMMIT_ORG,
  VERCEL_GITHUB_COMMIT_REPO,
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
    branch: VERCEL_GITHUB_COMMIT_REF,
    github: VERCEL_GITHUB_DEPLOYMENT ? {
      org: VERCEL_GITHUB_ORG,
      repo: VERCEL_GITHUB_REPO,
      commit: {
        org: VERCEL_GITHUB_COMMIT_ORG,
        repo: VERCEL_GITHUB_COMMIT_REPO,
        ref: VERCEL_GITHUB_COMMIT_REF,
        sha: VERCEL_GITHUB_COMMIT_SHA,
        author: {
          login: VERCEL_GITHUB_COMMIT_AUTHOR_LOGIN,
          name: VERCEL_GITHUB_COMMIT_AUTHOR_NAME
        }
      }
    } : false
  }
}
