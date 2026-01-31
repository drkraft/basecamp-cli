# Pagination Implementation Learnings

## RFC5988 Link Header Parsing
- Basecamp API uses RFC5988 standard for pagination via `Link` header
- Format: `Link: <url>; rel="next"` for next page
- Regex pattern: `/<([^>]+)>;\s*rel="next"/` extracts URL reliably
- Empty Link header indicates last page

## Got HTTP Client Integration
- Got's `.get()` returns response object with `.body` and `.headers`
- Must use `.get()` directly (not `.json()`) to access headers
- Headers are lowercase: `response.headers.link`
- Response body is already parsed JSON when using Got's default config

## Pagination Algorithm
- Loop while `nextUrl` is not null
- Extract items from response body (array)
- Parse Link header for next URL
- Aggregate all results into single array
- Maintains order across pages

## Type Safety
- Generic `fetchAllPages<T>()` works with any response type
- Properly typed with TypeScript generics
- No need for response wrapping - Basecamp returns arrays directly

## Testing Strategy
- Mock Got client with `.get()` returning response objects
- Test 3-page scenario, single page, empty response
- Verify order preservation across pages
- Test query parameter handling in URLs
- All 8 tests pass with 100% coverage of edge cases

## Integration Points
- Updated 7 list functions: listProjects, listTodoLists, listTodos, listMessages, getCampfireLines, listPeople
- No breaking changes to function signatures
- All existing tests continue to pass (40 total tests)
- LSP diagnostics clean

---

# Retry Logic Implementation Learnings

## Task: Wave 1, Task 3 - Add retry logic with exponential backoff

### Got.js Retry Configuration
- Got.js has native retry support via the `retry` option
- Retry config includes: `limit`, `methods`, `statusCodes`, `errorCodes`, `calculateDelay`
- The `calculateDelay` function receives `{ attemptCount }` and returns delay in milliseconds
- Exponential backoff formula: `Math.pow(2, attemptCount - 1) * 1000` gives 1s, 2s, 4s delays

### Retry-After Header Handling
- HTTP 429 responses may include a `Retry-After` header
- Can be in two formats:
  - Numeric seconds: `Retry-After: 60`
  - HTTP-date format: `Retry-After: Wed, 21 Oct 2025 07:28:00 GMT`
- Must parse both formats and use the specified delay instead of exponential backoff
- Implementation: Try parsing as integer first, then as Date

### Hook Architecture
- `beforeRetry`: Called before each retry attempt (useful for logging)
- `beforeError`: Called when error is about to be thrown (after all retries exhausted)
- Both hooks receive different parameters - check Got.js docs for exact signatures
- Hooks can modify behavior but should preserve original error for final throw

### Status Code Handling
- Retry on: 429, 500, 502, 503, 504
- Do NOT retry on: 4xx errors (except 429), 3xx redirects, 2xx success
- Each status code has different semantics:
  - 429: Rate limited (respect Retry-After)
  - 500: Internal server error (transient)
  - 502: Bad gateway (transient)
  - 503: Service unavailable (transient)
  - 504: Gateway timeout (transient)

### Error Messages
- Use `chalk.yellow()` for retry attempts (informational)
- Use `chalk.red()` for final errors after max retries (error state)
- Include attempt count and delay info in retry messages
- Preserve original error messages for non-retryable errors

### Testing with Vitest
- Test configuration, not actual HTTP calls
- Verify retry config has correct limits, methods, status codes
- Test exponential backoff calculation independently
- Test Retry-After header parsing with multiple formats
- Don't try to instantiate HTTPError directly in tests - test the config instead

### Code Organization
- Helper functions: `getRetryConfig()`, `getRetryAfterDelay()`
- Integration: Added `retry: getRetryConfig()` to createClient()
- Hooks: `beforeRetry` for logging, `beforeError` for final error handling
- All 28 tests pass with comprehensive scenario coverage

## CLI Interface Standardization (Wave 2, Task 5)

### Breaking Changes Implemented
- **Command Rename**: `basecamp me` → `basecamp people me`
  - Integrated standalone 'me' command as subcommand of 'people'
  - Maintains consistent pattern: `<resource> <action>`
  
- **Flag Standardization**: `--json` → `--format <format>`
  - All list/get commands now use `--format` with values: `table` (default) | `json`
  - Provides extensibility for future formats (csv, yaml, etc.)

- **Global Options**: Added `--verbose` flag
  - Available across all commands via `program.option()`
  - Positioned for future debug logging implementation

### Commander.js Patterns
- Global options defined on main program propagate to all subcommands
- Subcommands created with `.command()` and chained with `.action()`
- Default values specified in `.option()` third parameter
- Format check: `options.format === 'json'` (not `options.json`)

### Files Modified
- `src/index.ts`: Added global --verbose, removed createMeCommand import
- `src/commands/people.ts`: Integrated 'me' as subcommand, added --format
- `src/commands/projects.ts`: Replaced --json with --format
- `src/commands/todos.ts`: Replaced --json with --format (2 commands)
- `src/commands/messages.ts`: Replaced --json with --format
- `src/commands/campfires.ts`: Replaced --json with --format
- `README.md`: Updated examples and added Global Options section

### Verification
- Build: ✅ `bun run build` succeeded
- LSP: ✅ No diagnostics on any modified files
- Commit: ✅ `191d949 refactor(cli): standardize command interface`

### Pattern for Future Commands
```typescript
.command('action')
  .description('...')
  .option('-f, --format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    // ...
    if (options.format === 'json') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    // ... table output
  });
```


## Test Infrastructure Learnings (Task 6)

### Bun + Vitest Limitations
- `vi.importActual()` not supported in bun's vitest implementation
- `vi.resetModules()` and `vi.doMock()` not available
- MSW integration works but requires careful setup
- Simpler mocking strategies work better than complex module mocking

### Working Test Patterns
- Direct module imports with vi.mock() at top level
- Inline mocks without async importActual
- Integration tests that test actual behavior
- Pagination and retry tests work well with isolated logic

### Test Files Created
- src/__tests__/api.test.ts - API function tests (needs MSW fixes)
- src/__tests__/auth.test.ts - OAuth flow tests (needs MSW fixes)  
- src/__tests__/config.test.ts - Config management tests (working)
- Updated MSW handlers for comprehensive endpoint coverage

### Coverage Strategy
- Focus on testing actual behavior vs mocked behavior
- Config tests work well (encryption, storage, retrieval)
- Pagination and retry logic already well tested
- API and auth tests need MSW request interception fixes

