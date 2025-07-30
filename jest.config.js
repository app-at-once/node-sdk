module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'dist/**/*.js',
    '!dist/**/*.d.ts',
    '!dist/**/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // 30 seconds for API tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  clearMocks: false,
  resetMocks: false,
  restoreMocks: false,
  moduleNameMapper: {
    '^axios$': '<rootDir>/tests/__mocks__/axios.js'
  }
};