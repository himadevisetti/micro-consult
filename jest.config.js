const path = require('path');
const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['ts-jest', {
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }],
    ...tsJestTransformCfg,
  },
  roots: [
    '<rootDir>/expert-snapshot-legal/backend/functions/tokenInjection/test',
  ],
  modulePaths: [
    '<rootDir>/expert-snapshot-legal/backend/functions/tokenInjection/src',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

