import 'whatwg-fetch'
import { uriTemplate } from './template'
import validateDSW from './validateDSW'
import getJSON from './getJSON'

export default function buildHooks (specs) {
  const hooks = {}
  for (const [name, spec] of Object.entries(specs)) {
    if (typeof spec === 'object') {
      const hook = buildHook(spec)
      if (typeof hook === 'function') {
        console.info('Built hook for "%s":', name, spec)
        hooks[name] = hook
      } else {
        console.warn('No hook built for "%s":', name, spec)
      }
    } else {
      hooks[name] = spec
    }
  }
  return hooks
}

function buildHook (spec) {
  for (const [key, value] of Object.entries(spec)) {
    if (typeof namedBuilders[key] === 'function') {
      return namedBuilders[key](value)
    }
  }
}

const namedBuilders = {
  validateDSW,

  /**
   * This is a generic HTTP service validator, which takes the form.io
   * submission data and sends it to an external service URL, then either
   * resolves or rejects the submission depending on whether the service
   * request succeeded.
   *
   * HTTP services may respond with a 200 status and include an "error" object
   * (or "errors" array), which will be used to reject the submission.
   * Otherwise, 200 status indicates success and the submission will proceed
   * as-is.
   */
  validateWithService (options) {
    const {
      url: urlTemplate,
      method = 'POST',
      messages = {}
    } = options
    const getServiceURL = uriTemplate(urlTemplate)
    return (submission, next) => {
      const { data } = submission
      const url = getServiceURL(data)
      console.info('validating at:', url, 'with data:', data)
      getJSON(url, data, { method })
        .then(res => {
          console.info('validation response:', res)
          if (Object.keys(res).length === 0) {
            return next({
              message: messages.empty || 'Empty response'
            })
          }
          return next(res.errors || res.error)
        })
        .catch(next)
    }
  },

  /**
   * This hook redirects to a URL, which may be templated with the submission data.
   * You'll probably want to use this in conjunction with a beforeSubmit hook, e.g.
   *
   * {
   *   hooks: {
   *     beforeSubmit: {
   *       verifyDSW: { ... }
   *     }
   *   },
   *   on: {
   *     submit: {
   *       redirect: '/hooray?dsw={dsw}'
   *     }
   *   }
   * }
   */
  redirect (optionsOrURL) {
    const options = (typeof optionsOrURL === 'string') ? { url: optionsOrURL } : optionsOrURL
    const { url, map } = options
    const getURL = uriTemplate(url)
    return submission => {
      const { data } = submission
      if (map) {
        const mapped = {}
        for (const [sourceKey, destKey] of Object.entries(map)) {
          if (sourceKey in data) {
            mapped[destKey] = data[sourceKey]
          }
        }
        data.mapped = mapped
      }
      console.warn('redirect data:', data)
      const url = getURL(data)
      window.location = url
    }
  },

  /**
   * This is a validator for beforeSubmit hooks that checks the submitted data
   * against known key/value pairs. You can use it with:
   *
   * hooks: {
   *   values: {foo: 'bar'}
   * }
   *
   * Which will prevent submissions if the form's submission data doesn't match
   * the key/value pairs exactly, i.e. if `submission.data.foo !== 'bar'`.
   */
  values (values) {
    return (submission, next) => {
      const { data } = submission
      const errors = []
      for (const [key, value] of Object.entries(values)) {
        if (data[key] !== value) {
          const message = errorMessage(key, value, data)
          errors.push({ message })
        }
      }
      next(errors.length ? errors : null)
    }

    function errorMessage (key, value, data) {
      return `Expected "${key}" to have value ${JSON.stringify(value)}, but got ${JSON.stringify(data[key])}`
    }
  }
}
