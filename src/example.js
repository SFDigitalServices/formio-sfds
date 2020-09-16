const { Formio, location } = window

const root = document.getElementById('formio')

const params = new URLSearchParams(location.search || location.hash.substr(1))
const language = params.get('lang')
const formData = tryParse(root.getAttribute('data-form')) || {}

const options = Object.assign({
  language,
  unlockNavigation: true,
  googleTranslate: params.get('googleTranslate') === 'true'
}, tryParse(root.getAttribute('data-options')))

Formio.createForm(root, formData, options).then(form => {
  console.log('form ready:', form)
})

function tryParse (str) {
  if (!str) return
  try { return JSON.parse(str) } catch (error) {
    console.error('Unable to parse JSON:', str)
    return str
  }
}
