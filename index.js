const vfile = require('to-vfile');
const remark = require('remark');
const mdx = require('./remark-mdx');
const plugin = require('./plugin');

(async () => {
    const file = await vfile.read('./fixtures/example.md');
    const updated = await remark()
        .use(mdx)
        .use(plugin)
        .process(file);

    console.log(updated.toString());
})();
