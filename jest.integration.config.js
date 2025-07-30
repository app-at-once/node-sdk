module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.integration.test.js'],
  testTimeout: 60000, // 60 seconds for integration tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  // No mocks for integration tests
  moduleNameMapper: {}
};