/* eslint-env jest */

// jsdom doesn't provide an implementation for these, and it throws an error if
// you call them directly. Thankfully, Jest can spy on and mock them. See:
// <https://github.com/jsdom/jsdom/issues/1422>
const scroll = jest.fn()
jest.spyOn(window, 'scroll').mockImplementation(scroll)
jest.spyOn(window, 'scrollTo').mockImplementation(scroll)
