/* eslint-env jest */
import { createForm, destroyForm } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

const { FormioUtils } = window

const components = [
  { type: 'address' },
  { type: 'button' },
  { type: 'checkbox' },
  {
    type: 'columns',
    columns: [
      {
        width: 3,
        components: [{ type: 'textfield', key: 'left', label: 'Left' }]
      },
      {
        width: 3,
        components: [{ type: 'textfield', key: 'right', label: 'Right' }]
      }
    ]
  },
  { type: 'container' },
  { type: 'day' },
  { type: 'datetime' },
  { type: 'file' },
  { type: 'htmlelement', tag: 'h1', content: 'Hello, world!' },
  { type: 'content', html: 'Hello, world!' },
  { type: 'number' },
  {
    type: 'radio',
    values: [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 }
    ]
  },
  {
    type: 'selectboxes',
    values: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' }
    ]
  },
  { type: 'textfield' },
  {
    type: 'panel',
    title: 'Panel title',
    components: []
  },
  {
    type: 'form',
    display: 'wizard',
    components: [
      {
        type: 'panel',
        title: 'Page 1',
        properties: {
          displayTitle: 'Page 1 link title'
        },
        components: []
      },
      {
        type: 'panel',
        title: 'Page 2',
        components: []
      }
    ]
  },
  {
    type: 'select',
    widget: 'html5',
    data: {
      values: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' }
      ]
    }
  },
  { type: 'state' },
  { type: 'zip' }
]

describe('component snapshots', () => {
  const scenarios = {
    basic: {},
    required: {
      filter: model => model.type !== 'form',
      component: {
        validate: {
          required: true
        }
      }
    },
    translate: {
      filter: model => model.type === 'form',
      options: {
        translate: true
      }
    }
  }

  const { getRandomComponentId } = FormioUtils

  for (const comp of components) {
    describe(`component "${comp.type}"`, () => {
      for (const [name, props] of Object.entries(scenarios)) {
        const model = comp.type === 'form'
          ? Object.assign(
            {},
            comp,
            props.form
          )
          : {
            components: [
              Object.assign(
                {
                  label: `This is the ${comp.type} label`,
                  description: `This is the ${comp.type} description`
                },
                comp,
                props.component
              )
            ]
          }

        if (typeof props.filter === 'function' && !props.filter(model, props)) {
          // console.info('Skipping scenario "%s" for component "%s"', name, comp.type)
          continue
        }

        describe(`scenario: ${name}`, () => {
          it('matches the snapshot', async () => {
            let i = 0
            FormioUtils.getRandomComponentId = () => `${comp.type}-${name}-${i++}`

            const form = await createForm(model, props.options)

            updateSelectItems(form)

            form.element.id = `form-${comp.type}-${name}`
            const html = form.element.outerHTML
            expect(html).toMatchSnapshot()

            expect(form.element.textContent).not.toContain('Unknown component:')

            destroyForm(form)

            FormioUtils.getRandomComponentId = getRandomComponentId
          })
        })
      }
    })
  }
})

function updateSelectItems (form) {
  const selects = form.element.querySelectorAll('select.form-control')
  for (const select of selects) {
    const { id } = select.closest('[ref=component]')
    if (id) {
      const comp = form.getComponentById(id)
      if (typeof comp?.updateItems === 'function') {
        comp.updateItems()
      }
    }
  }
}
