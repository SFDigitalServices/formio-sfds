# formio-sfds
This is the [Form.io] theme for [sf.gov](https://sf.gov).

## Documentation
* [Usage](#usage)
    * [Browser](#browser)
    * [CSS](#css)
    * [Form.io portal](#formio-portal)
* [Custom components](docs/components.md#readme)
* [Formio patches](docs/patches.md)
    * [Form options](docs/patches.md#form-options)
    * [Form upgrades](docs/patches.md#form-upgrades)
    * [Icons](docs/patches.md#icons)
    * [Declarative actions](docs/patches.md#declarative-actions)
* [Localization](docs/localization.md#readme)
* [Development](docs/develop.md#readme)

## Usage

### Browser
The "standalone" JavaScript bundle is intended to be used in a browser (or
browser-like environment) via `<script>` tags. You'll need to include the
formiojs library in your document _before_ formio-sfds, like so:

```html
<script src="https://unpkg.com/formiojs@4.11.2/dist/formio.full.min.js"></script>
<script src="https://unpkg.com/formio-sfds@7.x/dist/formio-sfds.standalone.js"></script>
```


### CSS
The CSS in this package provides a suite of styles that target a mix of
Form.io-generated selectors and classes used in the custom theme templates, as
well as a collection of general-purpose utility classes for tweaking individual
elements.

**Note:** The `formio-sfds.standalone.js` bundle injects the CSS into the
`<head>` of the host document at runtime, so there's no need for a separate
`<link>` tag.

#### Scoped CSS
All of the selectors in the packaged CSS are scoped to (nested in) a
`.formio-sfds` class selector, which effectively prevents them from leaking
into the page where the form is embedded.

Unless you're using the [standalone bundle](#standalone-bundle) (which wraps
the form elements automatically), you'll need to wrap all of your the elements
targeted by `Formio.createForm()` with a `<div class="formio-sfds">`.


### Form.io portal
The "portal" bundle is intended for use _inside_ the form.io admin UI, and
customizes the palette of available components with [this theme's
components](docs/components.md). To use it, visit your form.io project Settings
page, and paste the URL below into the "Custom Javascript" (sic) field:

```
https://unpkg.com/formio-sfds@7.x/dist/portal.js
```

![](https://user-images.githubusercontent.com/113896/90575355-0d109a00-e170-11ea-9593-8be0afe88c70.png)


---

License: [MIT](./LICENSE)

[form.io]: https://form.io
[unpkg]: https://unpkg.com
