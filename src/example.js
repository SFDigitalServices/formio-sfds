const { Formio, location } = window

const root = document.getElementById('formio')

const params = new URLSearchParams(location.search || location.hash.substr(1))
const language = params.get('lang')
const i18n = tryParse(params.get('i18n'))
const renderMode = params.get('mode')
const hooks = tryParse(params.get('hooks'))
const formData = tryParse(root.getAttribute('data-form')) || {}
const unlockNavigation = true

const options = Object.assign({
  language,
  renderMode,
  hooks,
  unlockNavigation,
  i18n,
  googleTranslate: params.get('googleTranslate') === 'true',
  prefill: params,
  properties: tryParse(params.get('properties')) || {
    backURL: 'https://sf.gov/apply-building-permit',
    backTitle: 'Apply for a building permit'
  }
}, tryParse(root.getAttribute('data-options')))

Formio.createForm(root, formData, options).then(form => {
  console.log('form ready:', form)
  document.title = form.schema.title
})

function tryParse (str) {
  if (!str) return
  try { return JSON.parse(str) } catch (error) {
    console.error('Unable to parse JSON:', str)
    return str
  }
}
