import examples from './examples.yml'

const { Formio } = window

const defaults = {
  display: 'form'
}

main()

function main () {
  const template = document.getElementById('form-template')
  const root = template.parentNode
  const forms = []

  for (const example of examples) {
    const node = template.content.cloneNode(true).firstElementChild
    root.appendChild(node)
    const form = createForm(example, node)
    forms.push(form)
  }

  const { hash } = window.location
  if (hash) {
    const target = document.querySelector(hash)
    if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: 'smooth' })
    } else if (target) {
      window.location = hash
    }
  }
}

function createForm (example, node) {
  const { id, title } = example
  node.id = id
  node.querySelector('[data-placeholder=title]').innerHTML = `<a href="#${id}" class="fg-grey-4 no-u">#</a> ${title || id}`

  console.info('Mounting example:', example, 'to', node)

  const model = Object.assign({}, defaults, example)
  return Formio.createForm(node.querySelector('form'), model)
}
