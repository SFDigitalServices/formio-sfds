/* eslint-env jest */
import Phrase, { I18N_SERVICE_URL } from '../src/phrase'
import loadTranslations from '../src/i18n/load'
import patch from '../src/patch'
import { createForm, destroyForm } from '../lib/test-helpers'
import 'formiojs/dist/formio.full.min.js'

jest.mock('../src/i18n/load')

const { Formio } = window

beforeAll(() => {
  patch(Formio)
})

afterEach(() => {
  loadTranslations.mockRestore()
})

describe('Phrase helpers', () => {
  let phrase
  beforeEach(async () => {
    const form = await createForm({
      properties: {
        phraseProjectId: '123'
      }
    })
    phrase = new Phrase(form)
  })

  afterEach(() => {
    destroyForm(phrase.form)
    delete window.PHRASEAPP_ENABLED
    delete window.PHRASEAPP_CONFIG
  })

  describe('phrase.getTranslationInfo()', () => {
    it('finds form.properties.phraseProjectId', () => {
      expect(phrase.getTranslationInfo().projectId).toEqual('123')
    })

    it('respects form.properties.i18nServiceUrl', () => {
      const i18nServiceUrl = 'https://my-service.app'
      phrase.form.form.properties.i18nServiceUrl = i18nServiceUrl
      expect(phrase.getTranslationInfo().url).toEqual(`${i18nServiceUrl}/phrase/123`)
    })

    it('appends form.properties.phraseProjectVersion', () => {
      phrase.form.form.properties.phraseProjectVersion = '0.0.1'
      expect(phrase.getTranslationInfo().url).toEqual(`${I18N_SERVICE_URL}/phrase/123@0.0.1`)
    })

    it('interpolates form.properties.phraseProjectId', () => {
      const i18nServiceUrl = 'https://my-service.app/translate?projectId={phraseProjectId}'
      phrase.form.form.properties.i18nServiceUrl = i18nServiceUrl
      expect(phrase.getTranslationInfo().url).toEqual(i18nServiceUrl.replace('{phraseProjectId}', 123))
    })
  })

  describe('phrase.formatKey()', () => {
    it('formats a key with the default prefix and suffix', () => {
      expect(phrase.formatKey('foo')).toEqual('[[__phrase_foo__]]')
    })

    it('formats a key in an array', () => {
      expect(phrase.formatKey(['foo'])).toEqual('[[__phrase_foo__]]')
    })

    it('formats the first key in an array with multiple, non-empty values', () => {
      expect(phrase.formatKey(['foo', 'Foo!'])).toEqual('[[__phrase_foo__]]')
    })

    it('returns an empty string if given an array with an empty last value', () => {
      expect(phrase.formatKey(['foo', ''])).toEqual('')
    })

    it('respects the "context" option', () => {
      expect(phrase.formatKey('foo', { context: 'bar' })).toEqual('[[__phrase_foo._.bar__]]')
    })

    it('respects the "context" and "contextSeparator" options', () => {
      expect(phrase.formatKey('foo', {
        context: 'bar',
        contextSeparator: '._.'
      })).toEqual('[[__phrase_foo._.bar__]]')
    })
  })

  describe('phrase.t()', () => {
    it('returns a formatted key', () => {
      expect(phrase.t(['hello.world', 'Hello, world!'])).toEqual('[[__phrase_hello.world__]]')
      expect(phrase.t('hello.world', { context: 'greeting' })).toEqual('[[__phrase_hello.world._.greeting__]]')
    })

    it('does reverse lookups', async () => {
      loadTranslations.mockImplementationOnce(() => ({
        en: {
          greeting: 'Hello'
        },
        es: {
          greeting: 'Hola'
        }
      }))

      await phrase.load(loadTranslations)

      expect(phrase.reverseLookup.has('Hello')).toBe(true)
      expect(phrase.t('Hello')).toEqual('[[__phrase_greeting__]]')
      expect(phrase.t('Hello', { context: 'hey' })).toEqual('[[__phrase_greeting._.hey__]]')
    })
  })
})

describe('Phrase functionality', () => {
  describe('Formio.createForm() patches', () => {
    describe('Loading translations', () => {
      it('fetches translations from the I18N_SERVICE_URL if provided a string', async () => {
        const phraseProjectId = 'abcd1234'
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({
          properties: {
            phraseProjectId
          }
        }, {
          language: 'es'
        })
        expect(loadTranslations).toHaveBeenCalledWith(
          `${I18N_SERVICE_URL}/phrase/${phraseProjectId}`
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })

      it('obeys properties.i18nServiceUrl if provided', async () => {
        const phraseProjectId = 'abcd1234'
        const i18nServiceUrl = 'https://derp.app'
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({
          properties: {
            phraseProjectId,
            i18nServiceUrl
          }
        }, {
          language: 'es'
        })
        expect(loadTranslations).toHaveBeenCalledWith(
          `${i18nServiceUrl}/phrase/${phraseProjectId}`
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })

      it('appends properties.phraseProjectVersion to the translation URL', async () => {
        const phraseProjectId = 'abcd1234'
        const phraseProjectVersion = '1.0.1'
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({
          properties: {
            phraseProjectId,
            phraseProjectVersion
          }
        }, {
          language: 'es'
        })
        expect(loadTranslations).toHaveBeenCalledWith(
          `${I18N_SERVICE_URL}/phrase/${phraseProjectId}@${phraseProjectVersion}`
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })

      it('uses properites.i18nServiceUrl if provided', async () => {
        const phraseProjectId = 'abcd1234'
        const phraseProjectVersion = '1.0.1'
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({
          properties: {
            phraseProjectId,
            phraseProjectVersion
          }
        }, {
          language: 'es'
        })
        expect(loadTranslations).toHaveBeenCalledWith(
          `${I18N_SERVICE_URL}/phrase/${phraseProjectId}@${phraseProjectVersion}`
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })

      it('can interpolate other properties into i18nServiceUrl', async () => {
        const properties = {
          phraseProjectId: 'abc123',
          i18nServiceUrl: 'https://my-service.app/phrase/{phraseProjectId}'
        }
        loadTranslations.mockImplementationOnce(() => ({
          es: {
            hello: 'hola'
          }
        }))
        const form = await createForm({
          properties
        }, {
          language: 'es'
        })
        expect(loadTranslations).toHaveBeenCalledWith(
          properties.i18nServiceUrl.replace('{phraseProjectId}', properties.phraseProjectId)
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })
    })
  })

  describe('In-context editor setup', () => {
    const location = { search: '' }
    const mockLoc = jest.spyOn(window, 'location', 'get')
      .mockImplementation(() => location)

    beforeEach(() => {
      delete window.PHRASEAPP_ENABLED
    })

    afterEach(() => {
      delete window.PHRASEAPP_ENABLED
      delete window.drupalSettings
      location.search = ''
    })

    afterAll(() => {
      mockLoc.mockRestore()
    })

    it('does not load the editor if window.drupalSettings.user.uid is unset', async () => {
      const form = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })
      expect(window.PHRASEAPP_ENABLED).not.toBe(true)
      destroyForm(form)
    })

    it('does not load the editor if window.drupalSettings.user.uid === "0"', async () => {
      window.drupalSettings = { user: { uid: '0' } }
      const form = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })
      expect(window.PHRASEAPP_ENABLED).not.toBe(true)
      destroyForm(form)
    })

    it('does not load if ?translate=true is not in the query string', async () => {
      window.drupalSettings = { user: { uid: 12345 } }
      const form = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })
      expect(window.PHRASEAPP_ENABLED).not.toBe(true)
      destroyForm(form)
    })

    it('loads if window.drupalSettings.user.uid is set and ?translate=true is in the query string', async () => {
      window.location.search = 'translate=true'
      window.drupalSettings = { user: { uid: 12345 } }

      loadTranslations.mockImplementationOnce(() => ({
        es: {
          hello: 'Hola'
        }
      }))

      const form = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })

      expect(form.phrase.loaded).toBeInstanceOf(Object)
      expect(form.phrase.editorEnabled).toBe(true)

      // call expectations
      expect(loadTranslations).toHaveBeenCalledTimes(1)

      // state expectations
      expect(window.PHRASEAPP_ENABLED).toBe(true)
      expect(window.PHRASEAPP_CONFIG).toBeInstanceOf(Object)
      expect(window.PHRASEAPP_CONFIG.projectId).toBe('123')

      // cleanup
      destroyForm(form)
    })

    it('translates keys into placeholders', async () => {
      window.location.search = 'translate=true'
      window.drupalSettings = { user: { uid: 12345 } }

      loadTranslations.mockImplementationOnce(() => ({
        en: {
          derp: 'DERP'
        }
      }))

      const form = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })

      expect(form.t('derp')).toEqual('[[__phrase_derp__]]')
      // reverse lookup
      expect(form.t('DERP')).toEqual('[[__phrase_derp__]]')

      destroyForm(form)
    })

    xit('does not affect other forms', async () => {
      window.location.search = 'translate=true'
      window.drupalSettings = { user: { uid: 12345 } }

      const form1 = await createForm({
        properties: {
          phraseProjectId: '123'
        }
      })

      const form2 = await createForm()
      expect(form2.t(['derp', ''])).toEqual('derp')

      destroyForm(form1)
      destroyForm(form2)
    })
  })
})
