import { http, HttpResponse } from 'msw';

const BASECAMP_API_BASE = 'https://3.basecampapi.com';
const OAUTH_BASE = 'https://launchpad.37signals.com';

export const handlers = [
  http.post(`${OAUTH_BASE}/authorization/token`, () => {
    return HttpResponse.json({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
  }),

  http.get(`${OAUTH_BASE}/authorization.json`, () => {
    return HttpResponse.json({
      expires_at: '2025-12-31T23:59:59Z',
      identity: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_address: 'test@example.com',
      },
      accounts: [
        {
          id: 99999999,
          name: 'Test Account',
          product: 'bc3',
          href: 'https://3.basecampapi.com/99999999',
          app_href: 'https://3.basecamp.com/99999999',
        },
      ],
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/projects.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        dock: [],
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/projects/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      dock: [],
    });
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/projects.json`, () => {
    return HttpResponse.json({
      id: 2,
      name: 'New Project',
      description: '',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      dock: [],
    });
  }),

  http.put(`${BASECAMP_API_BASE}/99999999/projects/:id.json`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todosets/:todosetId/todolists.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todolists/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test To-Do List',
      description: 'A test to-do list',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todosets/:todosetId/todolists.json`, () => {
    return HttpResponse.json({
      id: 2,
      name: 'New To-Do List',
      description: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todolists/:listId/todos.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todos/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      content: 'Test to-do',
      completed: false,
      due_on: '2024-12-31',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todolists/:listId/todos.json`, () => {
    return HttpResponse.json({
      id: 2,
      content: 'New to-do',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todos/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      content: 'Updated to-do',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todos/:id/completion.json`, () => {
    return HttpResponse.json({});
  }),

  http.delete(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/todos/:id/completion.json`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/message_boards/:boardId/messages.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/messages/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      subject: 'Test Message',
      content: '<p>Test message content</p>',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/message_boards/:boardId/messages.json`, () => {
    return HttpResponse.json({
      id: 2,
      subject: 'New Message',
      content: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/chats/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      title: 'Test Campfire',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/chats/:chatId/lines.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        content: 'Test campfire line',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${BASECAMP_API_BASE}/99999999/buckets/:projectId/chats/:chatId/lines.json`, () => {
    return HttpResponse.json({
      id: 2,
      content: 'New campfire line',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/people.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test User',
        email_address: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/projects/:projectId/people.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Project User',
        email_address: 'project@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/people/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test User',
      email_address: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/99999999/my/profile.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Current User',
      email_address: 'me@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),
];
