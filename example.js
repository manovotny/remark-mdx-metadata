const vfile = require('to-vfile');
const remark = require('remark');

const mdx = require('./remark-mdx');

const plugin = require('./index');

(async () => {
    const file = await vfile.read('./__tests__/fixtures/existing-meta.mdx');
    const updated = await remark()
        .use(mdx)
        .use(plugin, {
            meta: {
                existingProp: 'updated value'
            }
        })
        .process(file);

    // eslint-disable-next-line no-console
    console.log(updated.toString());
})();
