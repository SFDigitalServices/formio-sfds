import { getJSON, mergeObjects } from '../utils'

export default function loadTranslations (urlOrUrls) {
  let urls = urlOrUrls
  if (!Array.isArray(urls)) {
    urls = [urls]
  }

  const promises = urls.map(url => {
    return getJSON(url, {}, { method: 'GET' })
      .then(res => res.data || {})
  })
  return Promise.all(promises)
    .then(objs => mergeObjects(...objs))
}
