import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Create MSW server with handlers
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Mock environment variables for tests
process.env.BASECAMP_CLIENT_ID = 'test-client-id';
process.env.BASECAMP_CLIENT_SECRET = 'test-client-secret';
process.env.BASECAMP_ACCESS_TOKEN = 'test-access-token';
