import { uriTemplate, interp } from './template'
import { getJSON } from '../utils'

// jsend statuses: <https://github.com/omniti-labs/jsend>
const STATUS_SUCCESS = 'success'
const STATUS_FAIL = 'fail'
const STATUS_ERROR = 'error'

export default function validateDSW (options) {
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

  const getServiceURL = uriTemplate(serviceURL)
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
          return next({ message: data.message || interp(ERROR_INELIGIBLE, interpolations) })
        } else {
          console.warn('assuming "%s" status:', STATUS_ERROR, status)
          return next({ message: data.message || interp(ERROR_UNKNOWN, interpolations) })
        }
      })
      .catch(error => {
        if (error instanceof Object) {
          next(error)
        } else {
          next({ message: error || interp(ERROR_UNKNOWN, {}) })
        }
      })
  }
}
