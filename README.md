---
title: Docs
---

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
    * [Autocomplete components](docs/autocomplete.md)
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


### Creating new versions
1. Open a PR in the formio-sfds repo (may need to add you as a collaborator so that you can open PRs directly and GitHub Actions will publish your changes to npm automatically)

2. In the PR checks, when you click “Show all checks”, you can copy the published version from the “publish formio-sfds” check:

3. Pop that 0.0.0-<sha> value into the "Form.io SFDS version" field on /admin/config/services/sfgov_formio in your local and multidev environments (not in the committed settings YAML — we only want to commit published versions)

4. Test your changes and get them reviewed in your multidev

5. Get the changes to formio-sfds approved and released

6. Update config/sfgov_formio.settings.yml by setting formio_sfds_version to the newly published release version (i.e. 9.2.3)

7. Re-test after deploying again to make sure it still works
