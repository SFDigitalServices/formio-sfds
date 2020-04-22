import examples from './examples.yml'
import pkg from '../package.json'

const { Formio } = window

const defaults = {
  display: 'form'
}

main()

function main () {
  for (const el of document.querySelectorAll('[data-package]')) {
    el.textContent = pkg[el.getAttribute('data-package')]
  }

  const formTemplate = document.getElementById('form-template')
  const linkTemplate = document.getElementById('example-link')
  const forms = []

  examples.sort((a, b) => {
    return (a.title && b.title)
      ? a.title.localeCompare(b.title)
      : 0
  })

  for (const example of examples) {
    const linkItem = linkTemplate.content.cloneNode(true).firstElementChild
    const link = linkItem.querySelector('[slot=link]')
    link.href = `#${example.id}`
    link.textContent = example.title || example.id
    linkTemplate.parentNode.appendChild(linkItem)

    const node = formTemplate.content.cloneNode(true).firstElementChild
    formTemplate.parentNode.appendChild(node)
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
  const heading = node.querySelector('[slot=title]')
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
