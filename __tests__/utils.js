/* eslint-env jest */
import { mergeObjects } from '../src/utils'

describe('mergeObjects()', () => {
  it('merges deeply', () => {
    expect(mergeObjects({
      one: 1,
      two: {
        three: 3
      }
    }, {
      four: 4,
      two: {
        five: 5
      }
    })).toEqual({
      one: 1,
      two: {
        three: 3,
        five: 5
      },
      four: 4
    })
  })

  it('preserves keys in the original object', () => {
    expect(mergeObjects({
      i18n: {
        zh: {
          original: 'original'
        }
      }
    }, {
      i18n: {
        zh: {
          other: 'other'
        }
      }
    })).toEqual({
      i18n: {
        zh: {
          original: 'original',
          other: 'other'
        }
      }
    })
  })
})
