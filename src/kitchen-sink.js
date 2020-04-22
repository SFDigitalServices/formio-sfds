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
    try {
      const form = createForm(example, node)
      forms.push(form)
    } catch (error) {
      node.querySelector('form').innerHTML = createError(error)
    }
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
  const heading = node.querySelector('[data-placeholder=title]')
  heading.innerHTML = `<a href="#${id}" class="fg-grey-4 no-u">#</a> ${title || id}`

  // console.info('Mounting example:', example, 'to', node)

  const model = Object.assign({}, defaults, example)
  const form = node.querySelector('form')
  return Formio.createForm(form, model)
    .catch(error => {
      form.innerHTML = createError(error)
    })
}

function createError (error) {
  return `<div role="alert" class="round-1 fg-red-4 bg-red-1"><pre class="p-1 m-0">${error.stack}</pre></div>`
}
