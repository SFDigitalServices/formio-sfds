import { getJSON } from '../utils'

export default function loadTranslations (url) {
  return getJSON(url, {}, { method: 'GET' })
    .then(res => {
      if (res.status === 'success') {
        return res.data
      } else {
        throw new Error(`Translation load error: ${JSON.stringify(res)}`)
      }
    })
}
