# formio-sfds
[form.io] templates for the SF Design System

## Usage

### HTML
Browsers will need the UMD bundle, which exports the theme to a global `FormioSFDS` object. First, load both the `formiojs` and `formio-sfds` bundles from your CDN of choice, e.g. [unpkg]:

```html
<script src="https://unpkg.com/formiojs/dist/formio.full.min.js"></script>
<script src="https://unpkg.com/formio-sfds/dist/formio-sfds.umd.js"></script>
```

Then, either in a deferred script or on window `load`, tell Formio to "use" the SFDS theme:

```js
Formio.use(FormioSFDS)
```

You'll need to do this _before_ you call `Formio.createForm()` to ensure that the templates are registered before the form is built.

### CommonJS

If you're using a CommonJS bundler like webpack, browserify, et al:

1. Install both `formiojs` and `formio-sfds` npm packages:

   ```
   npm install formiojs formio-sfds
   ```

2. Import in your app:

    ```js
    const { Formio } = require('formiojs')
    const FormioSFDS = require('formio-sfds')

    Formio.use(FormioSFDS)
    ```

License: [MIT](./LICENSE)

[form.io]: https://form.io
[unpkg]: https://unpkg.com
