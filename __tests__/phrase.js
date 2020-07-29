/* eslint-env jest */
import 'regenerator-runtime'
import Phrase from '../src/i18n/phrase'
import loadTranslations from '../src/i18n/load'
import patch from '../src/patch'
import { createForm, destroyForm } from '../lib/test-helpers'
import 'formiojs/dist/formio.full.min.js'

jest.mock('../src/i18n/load')

const { Formio } = window
const {
  I18N_SERVICE_URL = 'https://mock-i18n-service.app'
} = process.env

beforeAll(() => {
  patch(Formio)
})

describe('Phrase integration', () => {
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
  })

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
        expect(form.form.properties).toEqual({ phraseProjectId })
        expect(loadTranslations).toHaveBeenCalledWith(
          `${I18N_SERVICE_URL}/phrase/${phraseProjectId}`
        )
        expect(form.t('hello')).toEqual('hola')
        destroyForm(form)
      })
    })
  })
})
