const {parse} = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const template = require('@babel/template').default;
const t = require('@babel/types');

const isImport = (child) => child.type === 'import';

const hasImports = (index) => index > -1;

const isExport = (child) => child.type === 'export';

const isMeta = (child) => {
    let metaFound = false;

    const ast = parse(child.value, {
        sourceType: 'module'
    });

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

const parseChidlren = (tree) => {
    let importsIndex = -1;
    let meta;

    tree.children.forEach((child, index) => {
        if (isImport(child)) {
            importsIndex = index;
        } else if (isExport(child) && isMeta(child)) {
            meta = child;
        }
    });

    return {
        importsIndex,
        meta
    };
};

const updateMeta = (meta) => {
    const ast = parse(meta.value, {
        sourceType: 'module'
    });

    traverse(ast, {
        ObjectExpression: (path) => {
            let lastModifiedDateUpdated = false;

            path.node.properties.forEach((property) => {
                if (property.key.name === 'lastModifiedDate') {
                    property.value.value = 'UPDATED';
                    lastModifiedDateUpdated = true;
                }
            });

            if (!lastModifiedDateUpdated) {
                const property = t.objectProperty(t.identifier('lastModifiedDate'), t.stringLiteral('ADDED'));

                path.node.properties.push(property);
            }
        }
    });

    return {
        ...meta,
        value: generate(ast).code
    };
};

const createMeta = () => {
    const buildRequire = template(`
        export const meta = {
            lastModifiedDate: LAST_MODIFIED_DATE
        };
    `);

    const ast = buildRequire({
        LAST_MODIFIED_DATE: t.stringLiteral('CREATED')
    });

    return {
        type: 'export',
        default: false,
        value: generate(ast).code
    };
};

const insertMetaAfterImports = (children, meta, index) => [
    ...children.slice(0, index + 1),
    meta,
    ...children.slice(index + 1)
];

const insertMetaAtTopMdx = (children, meta) => [meta, ...children];

const plugin = () => {
    const transformer = (tree) => {
        let {importsIndex, meta} = parseChidlren(tree);

        if (meta) {
            meta = updateMeta(meta);
        } else {
            meta = createMeta();

            if (hasImports(importsIndex)) {
                tree.children = insertMetaAfterImports(tree.children, meta, importsIndex);
            } else {
                tree.children = insertMetaAtTopMdx(tree.children, meta);
            }
        }
    };

    return transformer;
};

module.exports = plugin;
