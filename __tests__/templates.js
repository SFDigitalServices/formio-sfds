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
                Your estimated total cost to reopen is \${{ 100 + (data.equipment || 0) }}.
              </div>
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

    it('renders expressions in {{}} template strings', () => {
      expect(form.element.querySelector('kbd').textContent)
        .toContain('Your estimated total cost to reopen is $100.')
    })
  })

  describe('htmlelement component', () => {
    it('renders submission data in translated content strings', async () => {
      const englishTemplate = 'My name is {{ data.name }}!'
      const spanishTemplate = '¡Mi nombre es {{ data.name }}!'
      // const translate = str => str.replace('{{ data.name }}', form.submission.data.name)
      const form = await createForm({
        components: [
          {
            type: 'hidden',
            key: 'name'
          },
          {
            type: 'htmlelement',
            content: englishTemplate,
            key: 'message'
          }
        ]
      }, {
        language: 'es',
        i18n: {
          es: {
            'message.content': spanishTemplate
          }
        }
      })

      expect(form.language).toBe('es')

      const data = {
        name: 'Mud'
      }

      form.submission = { data }
      await form.ready
      await form.redraw()

      const comp = form.components[1]
      const expectedOutput = '¡Mi nombre es Mud!'
      expect(comp.render()).toContain(expectedOutput)
      expect(comp.renderContent()).toContain(expectedOutput)
      expect(comp.rootValue).toEqual(data)
      expect(comp.element.textContent.trim()).toContain(expectedOutput)

      destroyForm(form)
    })
  })

  describe('content component', () => {
    it('renders content', async () => {
      const form = await createForm({
        components: [
          {
            type: 'content',
            html: 'My name is Mud.',
            refreshOnChange: true
          }
        ]
      })

      expect(form.element.textContent).toContain('My name is Mud.')

      destroyForm(form)
    })

    it('renders submission data in {{}} placeholders', async () => {
      const form = await createForm({
        components: [
          {
            type: 'textfield',
            key: 'name',
            label: 'Name'
          },
          {
            type: 'content',
            html: 'My name is {{ data.name }}!'
          }
        ]
      })

      await form.setSubmission({
        data: {
          name: 'Mud'
        }
      })

      expect(form.element.textContent).toContain('My name is Mud!')

      destroyForm(form)
    })

    it('renders submission data in translated content strings', async () => {
      const englishTemplate = 'My name is {{ data.name }}!'
      const spanishTemplate = '¡Mi nombre es {{ data.name }}!'
      // const translate = str => str.replace('{{ data.name }}', form.submission.data.name)
      const form = await createForm({
        components: [
          {
            type: 'hidden',
            key: 'name'
          },
          {
            type: 'content',
            html: englishTemplate,
            key: 'message'
          }
        ]
      }, {
        language: 'es',
        i18n: {
          es: {
            'message.html': spanishTemplate
          }
        }
      })

      expect(form.language).toBe('es')

      const data = {
        name: 'Mud'
      }

      await form.setSubmission({ data })

      const expectedOutput = '¡Mi nombre es Mud!'
      expect(form.components[1].render()).toContain(expectedOutput)
      expect(form.element.textContent.trim()).toContain(expectedOutput)

      destroyForm(form)
    })
  })
})
