/* eslint-env jest */
import 'regenerator-runtime'
import Phrase from '../src/i18n/phrase'
import loadTranslations from '../src/i18n/load'
import patch from '../src/patch'
import { createForm, destroyForm } from '../lib/test-helpers'
import 'formiojs/dist/formio.full.min.js'

require('dotenv').config()

jest.mock('../src/i18n/load')

const { Formio } = window
const { I18N_SERVICE_URL } = process.env

beforeAll(() => {
  patch(Formio)
})

describe('Phrase helpers', () => {
  describe('Phrase.getTranslationInfo()', () => {
    it('finds form.properties.phraseProjectId', () => {
      expect(Phrase.getTranslationInfo({
        options: {},
        form: {
          properties: {
            phraseProjectId: 123
          }
        }
      }).projectId).toEqual(123)
    })

    it('respects form.properties.i18nServiceUrl', () => {
      const i18nServiceUrl = 'https://my-service.app'
      expect(Phrase.getTranslationInfo({
        options: {},
        form: {
          properties: {
            phraseProjectId: 123,
            i18nServiceUrl
          }
        }
      }).url).toEqual(`${i18nServiceUrl}/phrase/123`)
    })

    it('appends form.properties.phraseProjectVersion', () => {
      expect(Phrase.getTranslationInfo({
        options: {},
        form: {
          properties: {
            phraseProjectId: 123,
            phraseProjectVersion: '0.0.1'
          }
        }
      }).url).toEqual(`${I18N_SERVICE_URL}/phrase/123@0.0.1`)
    })

    it('interpolates form.properties.phraseProjectId', () => {
      const i18nServiceUrl = 'https://my-service.app/translate?projectId={phraseProjectId}'
      expect(Phrase.getTranslationInfo({
        options: {},
        form: {
          properties: {
            phraseProjectId: 123,
            i18nServiceUrl
          }
        }
      }).url).toEqual(i18nServiceUrl.replace('{phraseProjectId}', 123))
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
})
