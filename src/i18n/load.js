import { getJSON } from '../utils'

export default function loadTranslations (url) {
  return getJSON(url, {}, { method: 'GET' })
    .then(res => res.data || {})
}
