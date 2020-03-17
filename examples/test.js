const { Formio } = require('formiojs')
const sfds = require('../src')

Formio.use(sfds)

const params = new URLSearchParams(window.location.search)
const resource = params.resource || 'https://sfds.form.io/shawntest1'

Formio.createForm(
  document.getElementById('formio'),
  resource
).then(form => {
  console.log('ready')
  form.on('initialized', (...args) => {
    console.log('initialized', args)
  })
  form.on('render', (...args) => {
    console.log('render', args)
  })
  form.on('change', (...args) => {
    console.log('change', args)
  })
})
