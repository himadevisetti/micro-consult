/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  // preset: require.resolve('ts-jest'),
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
}

