const core = require('@actions/core')
const github = require('@actions/github')

const options = {
  token: core.getInput('github-token'),
  environment: core.getInput('environment')
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

  core.info(`Context: ${JSON.stringify(github.context, null, 2)}`)
  return core.setFailed('HI')

  const { head: sha } = github.context.payload
  const octokit = github.getOctokit(token)
  const start = Date.now()

  const params = {
    ...github.context.repo,
    environment,
    sha
  }

  core.info('Deployment params:', params)

  while (true) {
    const { data: deployments } = await octokit.repos.listDeployments(params)
    core.info(`Found ${deployments.length} deployments...`)

    for (const deployment of deployments) {
      core.info(`\tgetting statuses for deployment ${deployment.id}...`)

      const { data: statuses } = await octokit.request('GET /repos/:owner/:repo/deployments/:deployment/statuses', {
        ...github.context.repo,
        deployment: deployment.id
      })

      core.info(`\tfound ${statuses.length} statuses`)

      const [success] = statuses
        .filter(status => status.state === 'success')
      if (success) {
        core.info(`\tsuccess! ${JSON.stringify(success, null, 2)}`)
        return {
          deployment,
          status: success,
          url: success.target_url
        }
      } else {
        core.info(`No statuses with state === "success": "${statuses.map(status => status.state).join('", "')}"`)
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
