/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('template tests', () => {
  describe('htmlelement component', () => {
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
            content: 'Hello, world!'
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
      expect(form.element.querySelector('kbd').textContent).toContain('Hello, world!')
    })
  })

  describe('content component', () => {
    it('renders content', async () => {
      const form = await createForm({
        components: [
          {
            type: 'content',
            content: 'Hello, world!'
          }
        ]
      })

      expect(form.element.textContent).toContain('Hello, world!')

      destroyForm(form)
    })
  })
})
