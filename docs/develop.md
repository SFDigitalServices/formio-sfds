# Development

## Workflow

1. [Set up your local development environment](#setup)
2. Make some changes and push to a new branch
3. [Open a pull request](https://github.com/SFDigitalServices/formio-sfds/compare?expand=1)
4. [Test your form](#proxy-testing)
5. Wait for status checks to pass and use the [published version](#publishing)
   in your form on sf.gov
6. Get your pull request reviewed and bump the package version by either:
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
There are a collection of HTML documents that power "views" in the Vercel app
deployment, and which you can use to test the theme against different form.io
data and scenarios:

- [index.html](../views/index.html) is the home page of the Vercel deployment,
  and renders each example defined in [examples.yml](../src/examples.yml).

  The schema is an array of example objects, each of which should conform to
  the [form.io form schema] and provide an additional, unique `id` property
  that allows you to deep-link to it on the page.

- [standalone.html](../views/standalone.html) is for testing the "standalone"
  JS bundle against the latest version of [formiojs] and a snapshot of CSS from
  [sf.gov]. It respects the following query string parameters:

  - `res` overrides the default resource or form URL so that you can test it
    with live forms. E.g. `?res=https://sfds.form.io/some-other-form`

  - `lang` overrides the form's language, for testing localization. E.g.
    `?lang=zh-TW`.

  - `hooks` can be used to pass [declarative hooks] that
    modify form behavior.

- [portal.html](../views/portal.html) is where you can test the "portal"
  bundle, which we add as a custom script on [form.io](https://form.io) to
  modify the form builder UI.

- [example.htm](../views/example.html) is used to render an isolated test case
  for each example in [examples.yml](../src/examples.yml). These are linked to
  in the heading of each example rendered on the home page.

### Proxy testing
The deployed app includes a serverless API endpoint that proxies sf.gov,
modifies the HTML, then returns it to the browser, effectively "injecting"
whatever version of formio-sfds you want _into_ sf.gov (or the Pantheon test
environment). Here's how it works:

1. Visit the Vercel deployment's
   [/api/preview](https://formio-sfds.vercel.app/api/preview) endpoint. By
   default, this will fetch [sf.gov/feedback](https://sf.gov/feedback) and
   replace whatever version of formio-sfds it's running with the bundle built
   with your deployment. (On the production Vercel deployment, this is the
   [latest release](https://github.com/SFDigitalServices/formio-sfds/releases).)

2. Change the query string parameters to modify the preview by appending a `?`
   and one or more of the following, separated with `&`:

    - `form=<url>` sets the form.io data source URL of the rendered form
    - `options=<json>` sets the formio.js render options JSON
    - `version=<semver>` changes the published version of formio-sfds, rather
      than using the bundle built by the Vercel deployment
    - `env=<env>` changes the name of the sf.gov environment from the default
      (sf.gov). `env=test` will set the hostname to the test environment.
    - `path=<path>` changes the request path from `/feedback`, so that you can
      test other pages on sf.gov that might have forms embedded on them.

    Some examples:

    - `/api/preview` (without any query string parameters) renders the
      [sf.gov feedback form](https://sf.gov/feedback) with the local build of
      formio-sfds.

    - `/api/preview?version=6.0.0&path=/node/1061` fetches
      [sf.gov/node/1061](https://sf.gov/node/1061) and renders it with
      [formio-sfds@6.0.0](http://unpkg.com/formio-sfds@6.0.0/)

    - `/api/preview?form=https://sfds-test.form.io/shawntest1` renders a test
      form on sf.gov with the local build of formio-sfds.

    - `/api/preview?options={"i18n":"..."}` can be used to render the feedback
      form with a different set of translations.

## Publishing
This repo uses [primer/publish] to publish new releases of the `formio-sfds`
npm package for every push that passes the [CI
workflow](../.github/workflows/ci.yml). The name of the branch determines the
"type" of release:

- Merges to the default branch (`main`) will release new versions to the
  `latest` (default) dist-tag if the `version` field in `package.json` has been
  incremented.
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
We use [unpkg] as our CDN. You can access every release published on npm via the version's unique URL:

```
https://unpkg.com/formio-sfds@<version>/
```

The trailing slash allows you to browse the published package file hierarchy.
Previously, our example and test pages were "hosted" as raw HTML from these URLs,
but you should view them [on the Vercel deployment](https://formio-sfds.vercel.app)
instead.

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
