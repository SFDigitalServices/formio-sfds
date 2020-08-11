/* eslint-env jest */
import { getStrings, getCondition, UIString, StringInterpolation } from '../lib/i18n'

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

      describe('possible strings in component.validate.custom', () => {
        function testValidateCustom (value, expectedStrings) {
          const strings = getStrings({
            components: [
              {
                key: 'yo',
                validate: {
                  custom: value
                }
              }
            ]
          })

          expect(strings).toHaveLength(expectedStrings.length)
          for (const [i, { key, value, context }] of Object.entries(expectedStrings)) {
            expect(strings[i].key).toBe(key)
            expect(strings[i].value).toBe(value)
            expect(strings[i].context).toBe(context)
          }
        }

        it('finds a string in double quotes', () => {
          testValidateCustom('valid = "Nope"', [
            { key: 'Nope', value: 'Nope', context: 'yo.validate.custom' }
          ])
        })

        it('finds a string in single quotes', () => {
          testValidateCustom('valid = "Nope"', [
            { key: 'Nope', value: 'Nope', context: 'yo.validate.custom' }
          ])
        })

        it('ignores quoted property accessors', () => {
          testValidateCustom('valid = data["wut"] || "Nope"', [
            { key: 'Nope', value: 'Nope', context: 'yo.validate.custom' }
          ])
          testValidateCustom("valid = data['wut'] || 'Nope'", [
            { key: 'Nope', value: 'Nope', context: 'yo.validate.custom' }
          ])
        })
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