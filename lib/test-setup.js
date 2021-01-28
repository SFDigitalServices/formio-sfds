/* eslint-env jest */
import 'formiojs/dist/formio.full.min.js'

/*
 * formiojs does this in their own Webform unit tests:
 *
 * <https://github.com/formio/formio.js/blob/d382a8a60162427a315f8fdf3d8158e66c7e3321/src/Webform.unit.js#L10>
 *
 * So, presumably something about flatpickr imported via
 * Formio.requireLibrary() doesn't work in jsdom? :shrug:
 */
import 'flatpickr'

// jsdom doesn't provide an implementation for these, and it throws an error if
// you call them directly. Thankfully, Jest can spy on and mock them. See:
// <https://github.com/jsdom/jsdom/issues/1422>
const scroll = jest.fn()
jest.spyOn(window, 'scroll').mockImplementation(scroll)
jest.spyOn(window, 'scrollTo').mockImplementation(scroll)
