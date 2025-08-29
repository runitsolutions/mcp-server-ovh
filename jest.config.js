/** @type {import('jest').Config} */
module.exports = {
  // Root directory for tests
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Test file pattern
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/tests/**/*.integration.js'
  ],

  // Transform TypeScript/JavaScript files
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest'
  },

  // File extensions to process
  moduleFileExtensions: ['js', 'ts', 'json'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.js',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage output directory
  coverageDirectory: 'coverage',

  // Coverage reports
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // Test environment configuration
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.js'],

  // Timeout for long tests
  testTimeout: 30000,

  // Mock configuration
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ]
};
