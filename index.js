const {parse} = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const stringifyObject = require('stringify-object');

const parseOptions = {
    plugins: ['jsx'],
    sourceType: 'module'
};
const isImport = (child) => child.type === 'import';
const hasImports = (index) => index > -1;
const isExport = (child) => child.type === 'export';
const stringifyPassedMeta = (meta) => `const passedMeta = ${stringifyObject(meta)}`;

const isMeta = (child) => {
    let metaFound = false;

    const ast = parse(child.value, parseOptions);

    traverse(ast, {
        VariableDeclarator: (path) => {
            if (path.node.id.name === 'meta') {
                metaFound = true;

                return;
            }
        }
    });

    return metaFound;
};

const getOrCreateExistingMetaIndex = (children) => {
    let importsIndex = -1,
        metaIndex = -1;

    children.forEach((child, index) => {
        if (isImport(child)) {
            importsIndex = index;
        } else if (isExport(child) && isMeta(child)) {
            metaIndex = index;
        }
    });

    if (metaIndex === -1) {
        const meta = {
            default: false,
            type: 'export',
            value: 'export const meta = {}'
        };

        metaIndex = hasImports(importsIndex) ? importsIndex + 1 : 0;
        children.splice(metaIndex, 0, meta);
    }

    return metaIndex;
};

const mergeMeta = (existingMeta, passedMeta) => {
    const passedAst = parse(passedMeta, parseOptions);
    const existingAst = parse(existingMeta, parseOptions);
    const passedProperties = [];

    traverse(passedAst, {
        VariableDeclarator: (path) => {
            path.node.init.properties.forEach((property) => {
                passedProperties.push(property);
            });
        }
    });

    traverse(existingAst, {
        VariableDeclarator: (path) => {
            const existingProperties = path.node.init.properties;
            const mergedProperties = [...existingProperties, ...passedProperties];
            const properties = [];

            mergedProperties.forEach((mergedProperty) => {
                const foundIndex = properties.findIndex(
                    (property) => property && property.key.name === mergedProperty.key.name
                );

                if (foundIndex > -1) {
                    properties[foundIndex] = mergedProperty;
                } else {
                    properties.push(mergedProperty);
                }
            });

            // eslint-disable-next-line no-param-reassign
            path.node.init.properties = properties;
        }
    });

    return generate(existingAst).code;
};

const plugin = (options = {}) => {
    const transformer = (tree) => {
        if (!options || !options.meta || Object.keys(options.meta).length === 0) {
            return;
        }

        const children = tree.children;
        const metaIndex = getOrCreateExistingMetaIndex(children);
        const existingMeta = children[metaIndex].value;
        const passedMeta = stringifyPassedMeta(options.meta);

        children[metaIndex].value = mergeMeta(existingMeta, passedMeta);
    };

    return transformer;
};

module.exports = plugin;
