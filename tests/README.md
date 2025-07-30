# AppAtOnce SDK Tests

This directory contains comprehensive tests for the AppAtOnce Node.js SDK.

## Test Structure

- `comprehensive-sdk-test.js` - Complete functional test suite that tests all SDK methods
- `sdk.test.js` - Jest unit tests with detailed test cases
- `setup.js` - Jest setup and global test utilities
- `run-tests.sh` - Test runner script that builds and runs all tests

## Running Tests

### Prerequisites

1. Build the SDK first:
   ```bash
   npm run build
   ```

2. Set environment variables (optional):
   ```bash
   export APPATONCE_TEST_API_KEY="your-test-api-key"
   export APPATONCE_TEST_BASE_URL="http://localhost:8091"
   ```

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Suites

```bash
# Run comprehensive functional tests
npm run test:comprehensive

# Run Jest unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run CI test suite (build + all tests)
npm run test:ci
```

### Manual Test Execution

```bash
# Run comprehensive test directly
node tests/comprehensive-sdk-test.js

# Run with verbose output
VERBOSE=true node tests/comprehensive-sdk-test.js

# Run tests script
./tests/run-tests.sh
```

## Test Coverage

The test suite covers:

1. **Server Health**
   - Server ping and status check

2. **Schema Operations**
   - Create table
   - List tables
   - Get table schema
   - Drop table

3. **Data Operations**
   - Insert (single and batch)
   - Select with various filters
   - Update records
   - Delete records
   - First/single record queries

4. **Query Features**
   - Where clauses
   - Equality filters (eq)
   - Ordering (orderBy)
   - Limiting results
   - Column selection

5. **Aggregate Functions**
   - Count
   - Sum
   - Average
   - Min/Max

6. **Advanced Features**
   - Search functionality
   - Batch operations
   - Real-time subscriptions
   - JSON data handling

7. **Error Handling**
   - Invalid API keys
   - Non-existent tables
   - Invalid queries

8. **Edge Cases**
   - Null values
   - Empty arrays
   - Special characters
   - Unicode/emoji support

## CI/CD Integration

The tests are automatically run in GitHub Actions:

1. On every push to main/develop branches
2. On pull requests
3. Before NPM package publication

The CI pipeline:
- Tests against multiple Node.js versions (16.x, 18.x, 20.x)
- Generates coverage reports
- Uploads results to Codecov
- Archives test artifacts

## Writing New Tests

When adding new SDK features:

1. Add functional tests to `comprehensive-sdk-test.js`
2. Add unit tests to `sdk.test.js` or create new test files
3. Ensure tests clean up after themselves
4. Use meaningful test descriptions
5. Test both success and error cases

## Test Database

Tests create temporary tables with prefix `test_<timestamp>_` and clean them up after completion. This ensures tests don't interfere with each other or existing data.

## Troubleshooting

1. **Tests fail with authentication error**
   - Ensure `APPATONCE_TEST_API_KEY` is set correctly
   - Verify the API key has appropriate permissions

2. **Tests timeout**
   - Check network connectivity to the API server
   - Increase timeout in `jest.config.js` if needed

3. **Build errors**
   - Run `npm run build` before running tests
   - Ensure TypeScript compilation succeeds

4. **Cleanup failures**
   - Tests attempt to clean up test tables
   - Manual cleanup may be needed if tests crash