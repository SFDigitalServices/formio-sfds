/* eslint-env jest */
import 'regenerator-runtime'
import patch from '../src/patch'
import { createElement, createForm, destroyForm } from '../lib/test-helpers'
import defaultTranslations from '../src/i18n'
import 'formiojs/dist/formio.full.min.js'

const SENTINEL_I18N_KEY = 'derp'
const SENTINEL_I18N_VALUE = 'DERP!'
defaultTranslations.en[SENTINEL_I18N_KEY] = SENTINEL_I18N_VALUE

const { Formio } = window
const { createForm: originalCreateForm } = Formio
patch(Formio)

describe('patch()', () => {
  it('patches Formio.createForm()', () => {
    expect(Formio.createForm).not.toBe(originalCreateForm)
  })

  describe('localization', () => {
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
    })

    describe('i18n options', () => {
      it('gets the default translations with no "i18n" option', async () => {
        const form = await createForm()
        expect(form.t(SENTINEL_I18N_KEY)).toEqual(SENTINEL_I18N_VALUE)
        destroyForm(form)
      })
    })
  })
})
