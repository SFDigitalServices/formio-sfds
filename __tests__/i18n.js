/* eslint-env jest */
import patch from '../src/patch'
import { getStrings, UIString, StringInterpolation } from '../lib/i18n'
import { createElement, createForm, destroyForm, sleep } from '../lib/test-helpers'
import loadTranslations from '../src/i18n/load'
import defaultTranslations from '../src/i18n'

jest.mock('../src/i18n/load')

const SENTINEL_I18N_KEY = 'derp'
const SENTINEL_I18N_VALUE = 'DERP!'
defaultTranslations.en[SENTINEL_I18N_KEY] = SENTINEL_I18N_VALUE

const { Formio } = window
patch(Formio)

describe('form localization', () => {
  describe('i18next.t() fallback support', () => {
    it('works with multiple fallback keys in an array', async () => {
      const form = await createForm()
      expect(form.t(['bleep.bloop', 'blurp'])).toEqual('blurp')
    })
  })

  describe('"language" option', () => {
    it('defaults to "en" if none is provided', async () => {
      const form = await createForm()
      expect(form.options.language).toEqual('en')
      destroyForm(form)
    })

    it('uses element.lang if present', async () => {
      const lang = 'es'
      const el = createElement('div', { lang })
      document.body.appendChild(el)
      const form = await Formio.createForm(el, {})
      expect(form.options.language).toEqual(lang)
      destroyForm(form)
    })

    it('uses document.documentElement.lang if present', async () => {
      const lang = 'es'
      document.documentElement.setAttribute('lang', lang)
      const form = await createForm()
      expect(form.options.language).toEqual(lang)
      destroyForm(form)
      document.documentElement.removeAttribute('lang')
    })

    it('allows "language" option to override DOM lang', async () => {
      const lang = 'es'
      document.documentElement.setAttribute('lang', 'en')
      const form = await createForm({}, { language: lang })
      expect(form.options.language).toEqual(lang)
      destroyForm(form)
      document.documentElement.removeAttribute('lang')
    })
  })

  describe('"i18n" option', () => {
    const mockUrl = 'http://my-translations.example.app'
    it('gets the default translations with no "i18n" option', async () => {
      const form = await createForm()
      expect(form.t(SENTINEL_I18N_KEY)).toEqual(SENTINEL_I18N_VALUE)
      destroyForm(form)
    })

    it('fetches translations from the URL if provided a string', async () => {
      loadTranslations.mockImplementationOnce(() => ({
        es: {
          hello: 'hola'
        }
      }))
      const form = await createForm({}, { i18n: mockUrl, language: 'es' })
      expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
      expect(form.t('hello')).toEqual('hola')
      destroyForm(form)
    })

    it('fails gracefully if translations fail to load', async () => {
      loadTranslations.mockImplementationOnce(() => {
        throw new Error('eeeek')
      })
      const form = await createForm({}, { i18n: mockUrl, language: 'es' })
      expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
      destroyForm(form)
    })

    it('fails gracefully if translation data is malformed', async () => {
      loadTranslations.mockImplementationOnce(() => 'lolwut')
      const form = await createForm({}, { i18n: mockUrl, language: 'es' })
      expect(loadTranslations).toHaveBeenCalledWith(mockUrl)
      destroyForm(form)
    })
  })

  describe('machine translation', () => {
    it('disables machine translation if "googleTranslate" === false', async () => {
      const form = await createForm({}, { googleTranslate: false })
      expect(form.element.getAttribute('translate')).toEqual('no')
      expect(Array.from(form.element.classList)).toContain('notranslate')
      destroyForm(form)
    })

    it('disables machine translation on .flatpickr-calendar elements', async () => {
      const el = createElement('div', { class: 'flatpickr-calendar' })
      document.body.appendChild(el)
      // selector-observer is async, so we need to wait a bit
      await sleep(50)
      expect(el.getAttribute('translate')).toEqual('no')
      expect(Array.from(el.classList)).toContain('notranslate')
      el.remove()
    })
  })
})

describe('i18n extraction', () => {
  describe('UIString', () => {
    it('throws an error if it does not get a value', () => {
      expect(() => new UIString()).toThrow()
    })

    it('throws an error if it does not get a component object', () => {
      expect(() => new UIString('foo')).toThrow()
      expect(() => new UIString('foo', null)).toThrow()
      expect(() => new UIString('foo', 'not-a-component')).toThrow()
      expect(() => new UIString('foo', 'not-a-component', 'path')).toThrow()
    })

    it('throws an error if it does not get a component with a "key" property', () => {
      expect(() => new UIString('foo', { key: null }, 'path')).toThrow()
    })

    it('has .type = "string"', () => {
      expect(new UIString('foo', { key: 'x' }, 'path').type).toBe('string')
    })

    it('.key combines the component.key and path', () => {
      expect(new UIString('foo', { key: 'y' }, 'label').key).toBe('y.label')
    })
  })

  describe('StringInterpolation', () => {
    it('provides all the proper context', () => {
      const str = new UIString('yo $t(hi)', { key: 'a' }, 'label')
      const int = new StringInterpolation('hi', str)
      expect(int.key).toBe('hi')
      expect(int.value).toBe('hi')
      expect(int.context).toBe('a.label')
      expect(int.string).toBe(str)
    })
  })

  describe('getStrings()', () => {
    describe('basic fields', () => {
      const fields = [
        'label',
        'description',
        'content',
        'html',
        'suffix'
      ]

      for (const field of fields) {
        describe(`finds "${field}"`, () => {
          it('in a single component', () => {
            const strings = getStrings({
              components: [
                {
                  key: 'derp',
                  [field]: 'value!'
                }
              ]
            })
            expect(strings).toHaveLength(1)
            expect(strings[0]).toBeInstanceOf(UIString)
            expect(strings[0].component.key).toBe('derp')
          })

          it('in a nested component', () => {
            const strings = getStrings({
              components: [
                {
                  components: [
                    {
                      key: 'derp',
                      [field]: 'value!'
                    }
                  ]
                }
              ]
            })
            expect(strings).toHaveLength(1)
            expect(strings[0]).toBeInstanceOf(UIString)
            expect(strings[0].component.key).toBe('derp')
          })

          it('in a columns component', () => {
            const strings = getStrings({
              components: [
                {
                  type: 'columns',
                  columns: [
                    {
                      components: [
                        {
                          key: 'derp',
                          [field]: 'value!'
                        }
                      ]
                    }
                  ]
                }
              ]
            })
            expect(strings).toHaveLength(1)
            expect(strings[0]).toBeInstanceOf(UIString)
            expect(strings[0].component.key).toBe('derp')
          })
        })
      }
    })

    describe('"label" edge cases', () => {
      const skipComponentTypes = [
        'content',
        'htmlelement',
        'panel'
      ]

      for (const type of skipComponentTypes) {
        it(`skips labels for "${type}" components`, () => {
          expect(getStrings({
            components: [
              {
                type,
                key: 'x',
                label: 'Label'
              }
            ]
          })).toHaveLength(0)
        })
      }

      it('skips labels if component.hideLabel is truthy', () => {
        expect(getStrings({
          components: [
            {
              label: 'Label',
              hideLabel: true
            }
          ]
        })).toHaveLength(0)
      })
    })

    describe('"title" field', () => {
      it('finds "title" in "panel" components', () => {
        const strings = getStrings({
          components: [
            {
              key: 'page1',
              type: 'panel',
              title: 'Page 1'
            }
          ]
        })
        expect(strings).toHaveLength(1)
        expect(strings[0].value).toBe('Page 1')
        expect(strings[0].key).toBe('page1.title')
      })

      it('skips "title" in non-"panel" components', () => {
        expect(getStrings({
          components: [
            {
              key: 'page1',
              type: 'textfield',
              title: 'Page 1'
            }
          ]
        })).toHaveLength(0)
      })
    })

    const letterComponent = {
      key: 'letter',
      values: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' }
      ]
    }

    describe('"values" field', () => {
      it('gets a string for each entry in component.values', () => {
        const strings = getStrings({
          components: [
            letterComponent
          ]
        })
        expect(strings).toHaveLength(2)
        expect(strings[0].key).toBe('letter.values.a')
        expect(strings[0].value).toBe('A')
        expect(strings[1].key).toBe('letter.values.b')
        expect(strings[1].value).toBe('B')
      })

      it('ignores non-array component.values', () => {
        expect(getStrings({
          components: [
            Object.assign({}, letterComponent, { values: 'wut' })
          ]
        })).toHaveLength(0)
      })
    })

    describe('"data" field', () => {
      describe('gets a string for each entry in component.data.values', () => {
        it('if component.dataSrc is falsy', () => {
          expect(getStrings({
            components: [
              Object.assign({}, letterComponent, {
                dataSrc: null
              })
            ]
          })).toHaveLength(2)
        })

        it("if component.dataSrc === 'values'", () => {
          expect(getStrings({
            components: [
              Object.assign({}, letterComponent, {
                dataSrc: 'values'
              })
            ]
          })).toHaveLength(2)
        })

        it('only if component.data.values is an array', () => {
          expect(getStrings({
            components: [
              Object.assign({}, letterComponent, {
                dataSrc: 'values',
                values: 'wut'
              })
            ]
          })).toHaveLength(0)
        })
      })
    })

    describe('"validate" field', () => {
      it('finds component.validate.customMessage', () => {
        const strings = getStrings({
          components: [
            {
              key: 'yo',
              validate: {
                customMessage: 'This is wrong'
              }
            }
          ]
        })
        expect(strings).toHaveLength(1)
        expect(strings[0].key).toBe('yo.validate.customMessage')
        expect(strings[0].value).toBe('This is wrong')
      })
    })

    describe('errors map', () => {
      it('gets a string for each non-empty key/value in component.errors', () => {
        const strings = getStrings({
          components: [
            {
              key: 'a',
              errors: {
                required: 'A is required!',
                pattern: ''
              }
            },
            {
              key: 'b',
              errors: {
                pattern: 'B must match the pattern'
              }
            }
          ]
        })

        expect(strings).toHaveLength(2)
        expect(strings[0].key).toBe('a.errors.required')
        expect(strings[0].value).toBe('A is required!')
        expect(strings[1].key).toBe('b.errors.pattern')
        expect(strings[1].value).toBe('B must match the pattern')
      })
    })

    describe('"customError" field', () => {
      it('finds the custom error', () => {
        const strings = getStrings({
          components: [
            {
              key: 'a',
              customError: 'Custom error'
            }
          ]
        })
        expect(strings).toHaveLength(1)
        expect(strings[0].key).toBe('a.customError')
        expect(strings[0].value).toBe('Custom error')
      })
    })

    describe('properties.displayTitle -> displayTitle mapping', () => {
      it('maps component.properites.displayTitle to "displayTitle" for panels', () => {
        const strings = getStrings({
          components: [
            {
              type: 'panel',
              key: 'page1',
              properties: {
                displayTitle: 'Display title'
              }
            }
          ]
        })

        expect(strings).toHaveLength(1)
        expect(strings[0].key).toBe('page1.displayTitle')
        expect(strings[0].value).toBe('Display title')
      })

      it('does *not* map component.properites.displayTitle for non-panels', () => {
        const strings = getStrings({
          components: [
            {
              type: 'textfield',
              key: 'name',
              properties: {
                displayTitle: 'Name'
              }
            }
          ]
        })

        expect(strings).toHaveLength(0)
      })
    })

    describe('interpolations', () => {
      it('finds $t() interpolations', () => {
        const strings = getStrings({
          components: [
            {
              key: 'a',
              type: 'content',
              content: 'This is a $t(building permit)'
            }
          ]
        })

        expect(strings).toHaveLength(2)
        expect(strings[0].type).toBe('string')
        expect(strings[0].key).toBe('a.content')
        expect(strings[0].value).toBe('This is a $t(building permit)')
        expect(strings[1].type).toBe('interpolation')
        expect(strings[1].key).toBe('building permit')
        expect(strings[1].value).toBe('building permit')
        expect(strings[1].context).toBe('a.content')
      })
    })
  })
})
