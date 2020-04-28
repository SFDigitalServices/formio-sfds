const { fetch } = window

// for JSON over HTTP
const CONTENT_TYPE_HEADER = 'Content-Type'
const JSON_CONTENT_TYPE = 'application/json'

/**
 * This is a light wrapper around fetch() that sets up the request options
 * automatically for "typical" JSON APIs. One thing to note is that the default
 * HTTP method is POST so that data can be easily serialized. If the "method"
 * option is "GET", then we append the data to the request URL as query string
 * parameters.
 */
export default function getJSON (url, data, options = {}) {
  const { method = 'POST', headers = {}, ...rest } = options
  headers[CONTENT_TYPE_HEADER] = JSON_CONTENT_TYPE

  const req = {
    method,
    headers,
    ...rest
  }

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
