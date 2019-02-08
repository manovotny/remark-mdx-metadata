module.exports = {
    collectCoverageFrom: ['**/*.sepc.js'],
    coverageDirectory: '.coverage',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    },
    snapshotSerializers: ['jest-snapshot-serializer-raw'],
    testEnvironment: 'node'
};
