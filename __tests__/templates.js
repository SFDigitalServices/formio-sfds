/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

describe('template tests', () => {
  describe('htmlelement component', () => {
    const expectedContent = 'Hello, world!'
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
            content: `
              <div style="white-space: pre-wrap;">
                  ${expectedContent}
                  Your estimated total cost to reopen is
                  \${{ 100 + (data.equipment || 0) }}.</div>
            `
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
      expect(form.element.querySelector('kbd').textContent).toContain(expectedContent)
    })

    it('renders data in template strings (${{}})', () => {
      expect(form.element.querySelector('kbd').textContent)
        .toContain('$100')
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
