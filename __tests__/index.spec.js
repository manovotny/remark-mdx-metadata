const {join} = require('path');

const {wrap} = require('jest-snapshot-serializer-raw');
const remark = require('remark');
const mdx = require('remark-mdx');
const vfile = require('to-vfile');

const plugin = require('../index');

const processFixture = async (name, options) => {
    const path = join(__dirname, 'fixtures', `${name}.mdx`);
    const file = await vfile.read(path);
    const result = await remark()
        .use(mdx)
        .use(plugin, options)
        .process(file);

    return result.toString();
};

test('should not modify file with no options', async () => {
    const options = undefined;
    const result = await processFixture('just-content', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should not modify file with empty options', async () => {
    const options = {};
    const result = await processFixture('just-content', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should not modify file with empty meta', async () => {
    const options = {
        meta: {}
    };
    const result = await processFixture('just-content', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should not modify export default', async () => {
    const options = {
        meta: {
            newProp: 'value'
        }
    };
    const result = await processFixture('export-default', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should add to existing meta', async () => {
    const options = {
        meta: {
            addProp: 'value'
        }
    };
    const result = await processFixture('existing-meta', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should update existing meta', async () => {
    const options = {
        meta: {
            existingProp: 'updated value'
        }
    };
    const result = await processFixture('existing-meta', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should insert below import', async () => {
    const options = {
        meta: {
            prop: 'value'
        }
    };
    const result = await processFixture('insert-below-import', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should insert below imports', async () => {
    const options = {
        meta: {
            prop: 'value'
        }
    };
    const result = await processFixture('insert-below-imports', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should insert at top of file when there is no imports', async () => {
    const options = {
        meta: {
            prop: 'value'
        }
    };
    const result = await processFixture('insert-top-of-file', options);

    expect(wrap(result)).toMatchSnapshot();
});

test('should handle complex meta', async () => {
    const options = {
        meta: {
            complex: {
                nested: {
                    prop: [123, '456']
                }
            }
        }
    };
    const result = await processFixture('existing-meta', options);

    expect(wrap(result)).toMatchSnapshot();
});
