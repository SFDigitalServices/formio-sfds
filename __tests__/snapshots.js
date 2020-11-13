/* eslint-env jest */
import 'html-validate/jest'
import { createForm, destroyForm, sleep } from '../lib/test-helpers'
import '../dist/formio-sfds.standalone.js'

const { Event, FormioUtils } = window

const validateConfig = {
  root: true,
  extends: [
    'htmlvalidate:recommended'
  ],
  rules: {
    // formiojs generates duplicate classes
    'no-dup-class': 'off',
    // we need these
    'no-inline-style': 'warn',
    // our templates output lots of trailing whitespace
    'no-trailing-whitespace': 'off'
  }
}

const comp = (type, config = {}) => {
  return {
    type,
    label: `This is the ${type} label`,
    description: `This is the ${type} description`,
    ...config
  }
}

const components = [
  comp('textfield'),
  comp('number'),
  comp('button'),
  comp('checkbox'),
  comp('address'),
  comp('columns', {
    columns: [
      {
        width: 3,
        components: [
          comp('textfield', { key: 'left', label: 'Left' })
        ]
      },
      {
        width: 3,
        components: [
          comp('textfield', { key: 'right', label: 'Right' })
        ]
      }
    ]
  }),
  comp('container', {
    components: [
      comp('textfield', { key: 'yo' })
    ]
  }),
  comp('day'),
  comp('datetime'),
  comp('htmlelement', {
    tag: 'h1',
    content: 'Hello, world!'
  }),
  comp('radio', {
    values: [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 }
    ]
  }),
  comp('selectboxes', {
    values: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' }
    ]
  }),
  comp('well', {
    label: 'Well hello',
    components: [
      comp('textfield', { label: 'Your name' })
    ]
  }),
  comp('well', {
    label: 'This label should NOT be visible',
    properties: {
      hideLabel: true
    },
    components: [
      comp('textfield', { label: 'Your name' })
    ]
  }),
  comp('panel', {
    components: [
      comp('textfield', { label: 'Your name' })
    ]
  }),
  comp('panel', {
    title: 'Panel title',
    components: []
  }),
  comp('form', {
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
  }),
  comp('state'),
  comp('zip')
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
            const select = form.element.querySelector('select:empty')
            if (select) {
              select.focus()
              select.dispatchEvent(new Event('change'))
              await sleep(100)
            }

            const rendered = form.render()
            expect(rendered).toHTMLValidate(validateConfig)

            form.element.removeAttribute('id')
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
