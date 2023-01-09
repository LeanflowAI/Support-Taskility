// https://jestjs.io/docs/en/configuration
module.exports = {
  setupFiles: ['<rootDir>/.jest/env.js'],
  testPathIgnorePatterns: ['cypress'],
  testTimeout: 15000,
  modulePaths: ['node_modules', '.'],
}
