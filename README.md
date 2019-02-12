# remark-mdx-metadata

> [Remark](https://remark.js.org/) transformer for modifying MDX metadata.

This is a [remark](https://remark.js.org/) plugin for externally modifying an MDX's metadata, which is useful for when you want to add or update properties like a last edited datetime or a link to edit on GitHub.

## Installation

### NPM

```
$ npm i remark-mdx-metadata
```

### Yarn

```
$ yarn add remark-mdx-metadata
```

## Usage

> This plugin requires [remark-mdx](https://github.com/mdx-js/mdx/tree/master/packages/remark-mdx) to parse mdx correctly,

Say we have the following file, `example.mdx`:

```
export const meta = {
    existingProp: 'existing value'
};

# Title

Content.
```

And our script, `example.js`, looks as follows:

```js
const vfile = require('to-vfile');
const remark = require('remark');
const mdx = require('remark-mdx');
const mdxMetadata = require('remark-mdx-metadata');

(async () => {
    const file = await vfile.read('example.mdx');
    const result = await remark()
        .use(mdx)
        .use(mdxMetadata, {
            meta: {
                lastEdited: `${new Date().toISOString()}`
            }
        })
        .process(file);

    console.log(result.toString());
})();
```

Now, running `node example` yields:

```
export const meta = {
    existingProp: 'existing value',
    lastEdited: '2018-09-02T18:58:18.000Z'
};

# Title

Content.
```

You can try this yourself by downloading or cloning the project, installing dependencies, and running `yarn example`.

## API

### `remark().use(mdxMetadata[, options])`

Adds or updates MDX metadata with the metadata supplied.

-   Adds new metadata property if it doesn't exist.
-   Updates existing metadata property if it does exist.
-   Intelligently merges new and existing metadata.
-   Will update the MDX metadata, in place, if there is existing metadata.
-   Will appropriately insert metadata if there isn't any existing metadata.

#### Options

##### `meta`

Type: `Object`

Specifies the metadata to add or update.

## License

MIT © [Michael Novotny](https://manovotny.com)
