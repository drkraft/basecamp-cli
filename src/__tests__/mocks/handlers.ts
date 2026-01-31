import { http, HttpResponse } from 'msw';

const BASECAMP_API_BASE = 'https://3.basecampapi.com';

export const handlers = [
  // Mock OAuth token endpoint
  http.post('https://launchpad.37signals.com/authorization/token', () => {
    return HttpResponse.json({
      access_token: 'test-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
  }),

  // Mock get accounts endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock get project endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects/1.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Mock get to-do lists endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects/1/todolists.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test To-Do List',
        description: 'A test to-do list',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock get to-dos endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects/1/todolists/1/todos.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        content: 'Test to-do',
        completed: false,
        due_on: '2024-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock get messages endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects/1/messages.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        subject: 'Test Message',
        content: '<p>Test message content</p>',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock get campfires endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/projects/1/campfires.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Campfire',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock get people endpoint
  http.get(`${BASECAMP_API_BASE}/99999999/people.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),
];
