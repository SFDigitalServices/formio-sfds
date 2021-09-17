---
title: Localization
---

# Localization
Translations for common form UI strings live in this project's [src/i18n
directory][src/i18n], which contains a JSON file for each of the languages that
we officially support:

File | Language | Notes
:--- | :--- | :---
[en.json] | English (default)
[es.json] | Spanish
[tl.json] | Filipino | technically `fil`, but we use the `tl` (Tagalog) language code
[zh.json] | Traditional Chinese | technically `zh-tw` or `zh-hant`

Entries in any of the JSON files are removed at build time so that form.io
doesn't display an empty string. The fallback behavior of form.io's `t()`
function is to return the "key" if the translated string is null, so given:

```js
Formio.createForm({
  components: [{
    type: 'textfield',
    label: 'Hi'
  }]
}, {
  language: 'es',
  i18n: {
    es: {
      Hi: 'Hola'
    }
  }
}).then(form => {
  alert(form.t('Hi'))
})
```

You _should_ see an alert that says `Hola`, even though there is no
"translation" for "Hi" in English.

## Third-party libraries
We patch several of the third-party libraries that formio.js uses to render
more complex components:

1. We import the Spanish and Chinese translations of [Flatpickr] directly
   to localize date and time pickers. These are not customizable right now.

1. We patch the `customOptions` of each [autocomplete component](./autocomplete.md#translation)
   to translate UI strings in [Choices.js].

[src/i18n]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n
[en.json]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n/en.json
[es.json]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n/es.json
[tl.json]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n/tl.json
[zh.json]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n/zh.json
[choices.js]: https://github.com/jshjohnson/Choices#readme
[flatpickr]: https://flatpickr.js.org/
