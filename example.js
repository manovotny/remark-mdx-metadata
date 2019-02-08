const vfile = require('to-vfile');
const remark = require('remark');

const mdx = require('./remark-mdx');

const plugin = require('./index');

(async () => {
    const file = await vfile.read('./__tests__/fixtures/export-default.mdx');
    const updated = await remark()
        .use(mdx)
        .use(plugin, {
            meta: {
                abc: 'updated',
                new: 'prop'
            }
        })
        .process(file);

    // eslint-disable-next-line no-console
    console.log(updated.toString());
})();
