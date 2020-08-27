const core = require('@actions/core')
const github = require('@actions/github')

const options = {
  token: core.getInput('github-token')
}

waitForDeployment(options)
  .then(res => {
    core.setOutput('id', res.deployment.id)
    core.setOutput('url', res.url)
  })
  .catch(error => {
    core.setFailed(error.message)
  })

async function waitForDeployment (options) {
  const {
    token,
    timeout = 300,
    delay = 50,
    environment
  } = options

  const { sha } = github.context.payload
  const octokit = github.getOctokit(token)
  const start = Date.now()

  const params = {
    ...github.context.repo,
    // environment,
    sha
  }

  console.info('Deployment params:', params)

  while (true) {
    const { data: deployments } = await octokit.repos.listDeployments(params)
    console.info('Found %d deployments...', deployments.length)

    for (const deployment of deployments) {
      console.info('Getting statuses for deployment %s...', deployment.id)

      const { data: statuses } = await octokit.request('GET /repos/:owner/:repo/deployments/:deployment/statuses', {
        ...github.context.repo,
        deployment: deployment.id
      })

      console.info('\tfound %d statuses...', statuses.length)

      const [success] = statuses
        .filter(status => status.state === 'success')
      if (success) {
        console.info('\tSuccess!', JSON.stringify(success, null, 2))
        return {
          deployment,
          status: success,
          url: success.target_url
        }
      } else {
        console.info(
          'No statuses with state === "success":',
          statuses.map(status => status.state)
        )
      }

      await sleep(delay)
    }

    const elapsed = (Date.now() - start) / 1000
    if (elapsed >= timeout) {
      throw new Error(`Timing out after ${timeout} seconds (${elapsed} elapsed)`)
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}