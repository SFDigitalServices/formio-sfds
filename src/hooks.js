import interpolate from 'interpolate'
import 'whatwg-fetch'

const { fetch } = window

// for JSON over HTTP
const CONTENT_TYPE_HEADER = 'Content-Type'
const JSON_CONTENT_TYPE = 'application/json'

// jsend statuses: <https://github.com/omniti-labs/jsend>
const STATUS_SUCCESS = 'success'
const STATUS_FAIL = 'fail'
const STATUS_ERROR = 'error'

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

  validateDSW (options) {
    const {
      serviceURL = 'https://my-json-server.typicode.com/SFDigitalServices/placeholder-data/dsw/{dsw}',
      method = 'POST',
      messages = {}
    } = options

    const {
      noToken: ERROR_NO_TOKEN = ({ response: { data } }) => `No token found in: ${JSON.stringify(data)}`,
      ineligible: ERROR_INELIGIBLE = 'The provided DSW "{submission.data.dsw}" is invalid or ineligible.',
      unknown: ERROR_UNKNOWN = 'An unknown error occurred when validating your DSW.'
    } = messages

    const getServiceURL = createTemplate(serviceURL)
    return (submission, next) => {
      const { data: subData } = submission
      const url = getServiceURL(subData)
      console.info('validating at:', url, 'with data:', subData)

      getJSON(url, subData, { method })
        .then(res => {
          console.info('validation response:', res)
          const interpolations = { submission, response: res }

          const { status, data = {} } = res
          if (status === STATUS_SUCCESS) {
            if (data.token) {
              submission.data.token = data.token
            } else {
              next({ message: interp(ERROR_NO_TOKEN, interpolations) })
            }
            return next()
          } else if (status === STATUS_FAIL) {
            return next({ message: interp(ERROR_INELIGIBLE, interpolations) })
          }

          console.warn('assuming "%s" status:', STATUS_ERROR, status)
          next({ message: data.error || interp(ERROR_UNKNOWN, interpolations) })
        })
        .catch(error => {
          if (error instanceof Object) {
            next(error)
          } else {
            next({ message: error || interp(ERROR_UNKNOWN, {}) })
          }
        })
    }
  },

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
    const getServiceURL = createTemplate(urlTemplate)
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
  redirect (url) {
    const getURL = createTemplate(url)
    return submission => {
      const url = getURL(submission.data)
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

/**
 * This is a light wrapper around fetch() that sets up the request options
 * automatically for "typical" JSON APIs. One thing to note is that the default
 * HTTP method is POST so that data can be easily serialized. If the "method"
 * option is "GET", then we append the data to the request URL as query string
 * parameters.
 */
function getJSON (url, data, options = {}) {
  const { method = 'POST', headers = {}, ...rest } = options
  headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE
  const req = { method, headers, ...rest }
  if (method === 'GET') {
    const urlWithParams = new URL(url)
    for (const [key, value] of Object.entries(data)) {
      urlWithParams.searchParams.append(key, value)
    }
    url = urlWithParams.toString()
  } else {
    req.body = JSON.stringify(data)
  }
  return fetch(url, req).then(res => res.json())
}

function createTemplate (template) {
  return data => interp(template, data)
}

function interp (template, data) {
  return (typeof template === 'function') ? template(data) : interpolate(template, data)
}
