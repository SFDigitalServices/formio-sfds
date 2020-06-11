# Development

## Workflow

1. [Set up your local development environment](#setup)
2. Make some changes and push to a new branch
3. [Open a pull request](https://github.com/SFDigitalServices/formio-sfds/compare?expand=1)
4. Wait for status checks to pass and use the [published version](#publishing)
   in your form on sf.gov
5. Get your pull request reviewed and bump the package version by either:
    - running `script/version <version|patch|minor|major>` and pushing the commit(s), or
    - merging your pull request into a release branch

## Local development

### Setup
1. Clone this repo, e.g.
    ```sh
    git clone https://github.com/SFDigitalServices/formio-sfds
    ```
2. Run `npm install` to install all of the dependencies
3. Run `npm run watch` to build all of the browser-ready JS and CSS, and
   rebuild whenever changes are made to the source.

Running `npm run` without any additional arguments will list all of the
available scripts, most notably:

- `npm run lint` to lint the JS and SCSS source files
- `npm run build` to do a one-time build (without watching), or
  `NODE_ENV=production npm run build` to build minified assets

### Local testing
There are a collection of HTML documents in the repo root that you can use to
test the theme against different form.io data and scenarios:

- [index.html](../index.html) is the "kitchen sink" demo, which renders a
  separate form for each example described in
  [examples.yml](../src/examples.yml). The schema is an array of example
  objects, each of which should conform to the [form.io form schema] and
  provide an additional, unique `id` property that allows you to deep-link to
  it on the page.

- [standalone.html](../standalone.html) is for testing the "standalone" JS
  bundle against the latest version of [formiojs] and a snapshot of CSS from
  [sf.gov]. It respects the following query string parameters:

  - `res` overrides the default resource or form URL so that you can test it
    with live forms. E.g. `?res=https://sfds.form.io/some-other-form`

  - `lang` overrides the form's language, for testing localization. E.g.
    `?lang=zh-TW`.

  - `hooks` can be used to pass [declarative hooks] that
    modify form behavior.

- [hooks.html](../hooks.html) is geared toward testing [declarative hooks], and
  without any query string parameters renders a form that validates SF employee
  DSW numbers using an external web service, then passes submission data via
  the query string to the `on.submit.redirect.url`.

  This page also includes a textarea containing JSON that can be copied and
  pasted into the sf.gov form page editing UI to publish forms that follow the
  same logic, which works well with query string parameters:

  - `res` overrides the default resource or form URL so that you can test it
    with live forms. E.g. `?res=https://sfds.form.io/some-other-form`

  - `on` can be used to specify a JSON payload for
  [declarative event listeners][declarative hooks], e.g.

    ```
    ?on={"submit":{"redirect":{"url":"javascript:alert('hi!')"}}}
    ```

  - `hooks` overrides the [declarative hooks] example with JSON, just like `on`.

## Publishing
This repo uses [primer/publish] to publish new releases of the `formio-sfds`
npm package for every push that passes the [CI
workflow](../.github/workflows/ci.yml). The name of the branch determines the
"type" of release:

- Merges to `master` will release new versions to the `latest` (default)
  dist-tag if the `version` field in `package.json` has been incremented.
- Pushes to `release-<version>` will publish npm releases to the `next`
  dist-tag with versions in the form `<version>-rc.<sha>`, where `<sha>` is the
  7-character commit SHA.
- Pushes to any other branch will publish releases to the `canary` dist-tag
  with versions in the form `0.0.0-<sha>`.

You can find the release version for a given branch by navigating to either an
open pull request or the "tree" view of that branch on github.com, and clicking
on the status icon of the most recent commit:

| Where | What it looks like |
| :---- | :---- |
| Commit status icon | ![image](https://user-images.githubusercontent.com/113896/80157039-33d01280-857a-11ea-83bb-d547343d4faa.png)
| Merge box | ![image](https://user-images.githubusercontent.com/113896/80157076-46e2e280-857a-11ea-9c84-12c4438f1dfd.png)
| Branch tree view | ![image](https://user-images.githubusercontent.com/113896/80157168-6b3ebf00-857a-11ea-9563-47e41985da39.png)

### unpkg
We use [unpkg] as our CDN. As soon as a release is published, you can access it
on unpkg.com via the version's unique URL:

```
https://unpkg.com/formio-sfds@<version>/
```

The trailing slash allows you to browse the published package file hierarchy.
From there you can navigate to any of the HTML files and then click the <kbd>View
Raw</kbd> link to render the examples live.

**Note:** unpkg.com will strip the query string from any URL you give it, but
query string parameters can be passed to those URLs (once, on load) via the
hash. In other words, just replace the `?` in your query string with `#`.
Remember: You'll need to refresh the page after changing the hash!

[declarative hooks]: ../#declarative-hooks
[form.io form schema]: https://github.com/formio/formio.js/wiki/Form-JSON-Schema
[formiojs]: https://www.npmjs.com/package/formiojs
[primer/publish]: https://github.com/primer/publish
[sf.gov]: https://sf.gov
[unpkg]: https://unpkg.com
