/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('template tests', () => {
  describe('htmlelement component', () => {
    const content = 'Hello, world!'
    let form
    beforeAll(async () => {
      form = await createForm({
        components: [
          {
            type: 'htmlelement',
            tag: 'kbd',
            attrs: [
              { attr: 'id', value: 'foo' }
            ],
            content
          }
        ]
      })
    })

    afterAll(() => destroyForm(form))

    it('renders the element', async () => {
      expect(form.element.querySelectorAll('kbd')).toHaveLength(1)
    })

    it('renders attributes', async () => {
      expect(form.element.querySelector('kbd').id).toBe('foo')
    })

    it('renders content', async () => {
      expect(form.element.querySelector('kbd').textContent).toContain(content)
    })
  })

  describe('content component', () => {
    it('renders content', async () => {
      const content = 'This is the content!'
      const form = await createForm({
        components: [
          {
            type: 'content',
            html: content
          }
        ]
      })

      expect(form.element.textContent).toContain(content)

      destroyForm(form)
    })
  })
})
