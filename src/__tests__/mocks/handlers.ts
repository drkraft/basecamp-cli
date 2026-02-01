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

  http.get(`${BASECAMP_API_BASE}/:accountId/projects.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/projects/:id.json`, () => {
    return HttpResponse.json({
      id: 2085958499,
      name: 'Test Project',
      description: 'Test Description',
      status: 'active',
      purpose: 'topic',
      clients_enabled: false,
      created_at: '2022-11-18T09:50:54.566Z',
      updated_at: '2022-11-18T09:50:54.760Z',
      bookmark_url: 'https://3.basecampapi.com/test',
      url: 'https://3.basecampapi.com/195539477/projects/2085958499.json',
      app_url: 'https://3.basecamp.com/195539477/projects/2085958499',
      bookmarked: false,
      dock: [
        {
          id: 1069482091,
          title: 'Card Table',
          name: 'kanban_board',
          enabled: true,
          position: 1,
          url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/1069482091.json',
          app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/1069482091'
        },
        {
          id: 1069479846,
          title: 'Schedule',
          name: 'schedule',
          enabled: true,
          position: 2,
          url: 'https://3.basecampapi.com/195539477/buckets/2085958499/schedules/1069479846.json',
          app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/schedules/1069479846'
        }
      ],
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/projects.json`, () => {
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

  http.put(`${BASECAMP_API_BASE}/:accountId/projects/:id.json`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todosets/:todosetId/todolists.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todolists/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test To-Do List',
      description: 'A test to-do list',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todosets/:todosetId/todolists.json`, () => {
    return HttpResponse.json({
      id: 2,
      name: 'New To-Do List',
      description: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todolists/:listId/todos.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todos/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      content: 'Test to-do',
      completed: false,
      due_on: '2024-12-31',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todolists/:listId/todos.json`, () => {
    return HttpResponse.json({
      id: 2,
      content: 'New to-do',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todos/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      content: 'Updated to-do',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todos/:id/completion.json`, () => {
    return HttpResponse.json({});
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todos/:id/completion.json`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/message_boards/:boardId/messages.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/messages/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      subject: 'Test Message',
      content: '<p>Test message content</p>',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/message_boards/:boardId/messages.json`, () => {
    return HttpResponse.json({
      id: 2,
      subject: 'New Message',
      content: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/chats/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      title: 'Test Campfire',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/chats/:chatId/lines.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        content: 'Test campfire line',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/chats/:chatId/lines.json`, () => {
    return HttpResponse.json({
      id: 2,
      content: 'New campfire line',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/people.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/projects/:projectId/people.json`, () => {
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

  http.get(`${BASECAMP_API_BASE}/:accountId/people/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test User',
      email_address: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

   http.get(`${BASECAMP_API_BASE}/:accountId/my/profile.json`, () => {
     return HttpResponse.json({
       id: 1,
       name: 'Current User',
       email_address: 'me@example.com',
       created_at: '2024-01-01T00:00:00Z',
       updated_at: '2024-01-01T00:00:00Z',
     });
   }),

   http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/comments.json`, () => {
     return HttpResponse.json([
       {
         id: 1,
         status: 'active',
         visible_to_clients: true,
         created_at: '2024-01-15T10:30:00Z',
         updated_at: '2024-01-15T10:30:00Z',
         title: 'Comment',
         inherits_status: false,
         type: 'Comment',
         url: 'https://3.basecampapi.com/:accountId/comments/1.json',
         app_url: 'https://basecamp.com/:accountId/projects/999/comments/1',
         parent: {
           id: 888,
           title: 'Recording',
           type: 'Todo',
           url: 'https://3.basecampapi.com/:accountId/todos/888.json',
           app_url: 'https://basecamp.com/:accountId/projects/999/todos/888'
         },
         bucket: {
           id: 999,
           name: 'Test Project',
           type: 'Project'
         },
         creator: {
           id: 1,
           attachable_sgid: 'sgid-123',
           name: 'John Doe',
           email_address: 'john@example.com',
           personable_type: 'User',
           title: 'Developer',
           bio: null,
           location: null,
           created_at: '2024-01-01T00:00:00Z',
           updated_at: '2024-01-01T00:00:00Z',
           admin: false,
           owner: false,
           client: false,
           employee: true,
           time_zone: 'UTC',
           avatar_url: 'https://example.com/avatar.jpg',
           can_manage_projects: false,
           can_manage_people: false
         },
         content: 'This is a test comment'
       }
     ]);
   }),

   http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/comments/:id.json`, () => {
     return HttpResponse.json({
       id: 1,
       status: 'active',
       visible_to_clients: true,
       created_at: '2024-01-15T10:30:00Z',
       updated_at: '2024-01-15T10:30:00Z',
       title: 'Comment',
       inherits_status: false,
       type: 'Comment',
       url: 'https://3.basecampapi.com/:accountId/comments/1.json',
       app_url: 'https://basecamp.com/:accountId/projects/999/comments/1',
       parent: {
         id: 888,
         title: 'Recording',
         type: 'Todo',
         url: 'https://3.basecampapi.com/:accountId/todos/888.json',
         app_url: 'https://basecamp.com/:accountId/projects/999/todos/888'
       },
       bucket: {
         id: 999,
         name: 'Test Project',
         type: 'Project'
       },
       creator: {
         id: 1,
         attachable_sgid: 'sgid-123',
         name: 'John Doe',
         email_address: 'john@example.com',
         personable_type: 'User',
         title: 'Developer',
         bio: null,
         location: null,
         created_at: '2024-01-01T00:00:00Z',
         updated_at: '2024-01-01T00:00:00Z',
         admin: false,
         owner: false,
         client: false,
         employee: true,
         time_zone: 'UTC',
         avatar_url: 'https://example.com/avatar.jpg',
         can_manage_projects: false,
         can_manage_people: false
       },
       content: 'This is a test comment'
     });
   }),

   http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/comments.json`, () => {
     return HttpResponse.json({
       id: 2,
       status: 'active',
       visible_to_clients: true,
       created_at: '2024-01-15T10:30:00Z',
       updated_at: '2024-01-15T10:30:00Z',
       title: 'Comment',
       inherits_status: false,
       type: 'Comment',
       url: 'https://3.basecampapi.com/:accountId/comments/2.json',
       app_url: 'https://basecamp.com/:accountId/projects/999/comments/2',
       parent: {
         id: 888,
         title: 'Recording',
         type: 'Todo',
         url: 'https://3.basecampapi.com/:accountId/todos/888.json',
         app_url: 'https://basecamp.com/:accountId/projects/999/todos/888'
       },
       bucket: {
         id: 999,
         name: 'Test Project',
         type: 'Project'
       },
       creator: {
         id: 1,
         attachable_sgid: 'sgid-123',
         name: 'John Doe',
         email_address: 'john@example.com',
         personable_type: 'User',
         title: 'Developer',
         bio: null,
         location: null,
         created_at: '2024-01-01T00:00:00Z',
         updated_at: '2024-01-01T00:00:00Z',
         admin: false,
         owner: false,
         client: false,
         employee: true,
         time_zone: 'UTC',
         avatar_url: 'https://example.com/avatar.jpg',
         can_manage_projects: false,
         can_manage_people: false
       },
       content: 'New test comment'
     });
   }),

   http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/comments/:id.json`, () => {
     return HttpResponse.json({
       id: 1,
       status: 'active',
       visible_to_clients: true,
       created_at: '2024-01-15T10:30:00Z',
       updated_at: '2024-01-15T11:00:00Z',
       title: 'Comment',
       inherits_status: false,
       type: 'Comment',
       url: 'https://3.basecampapi.com/:accountId/comments/1.json',
       app_url: 'https://basecamp.com/:accountId/projects/999/comments/1',
       parent: {
         id: 888,
         title: 'Recording',
         type: 'Todo',
         url: 'https://3.basecampapi.com/:accountId/todos/888.json',
         app_url: 'https://basecamp.com/:accountId/projects/999/todos/888'
       },
       bucket: {
         id: 999,
         name: 'Test Project',
         type: 'Project'
       },
       creator: {
         id: 1,
         attachable_sgid: 'sgid-123',
         name: 'John Doe',
         email_address: 'john@example.com',
         personable_type: 'User',
         title: 'Developer',
         bio: null,
         location: null,
         created_at: '2024-01-01T00:00:00Z',
         updated_at: '2024-01-01T00:00:00Z',
         admin: false,
         owner: false,
         client: false,
         employee: true,
         time_zone: 'UTC',
         avatar_url: 'https://example.com/avatar.jpg',
         can_manage_projects: false,
         can_manage_people: false
       },
       content: 'Updated comment content'
     });
   }),

   http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/comments/:id.json`, () => {
     return HttpResponse.json({});
   }),

  // Card Tables
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/:id.json`, () => {
    return HttpResponse.json({
      id: 1069482091,
      title: 'Card Table',
      type: 'Kanban::Board',
      status: 'active',
      visible_to_clients: false,
      inherits_status: true,
      created_at: '2022-11-18T09:51:27.237Z',
      updated_at: '2022-11-18T09:51:27.237Z',
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/1069482091',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/1069482091.json',
      bookmark_url: 'https://3.basecampapi.com/test',
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project',
      },
      creator: {
        id: 1049716070,
        attachable_sgid: 'test-sgid',
        name: 'Victor Cooper',
        email_address: 'victor@example.com',
        personable_type: 'User',
        title: 'Chief Strategist',
        bio: 'Test bio',
        location: 'Chicago, IL',
        created_at: '2022-11-18T09:50:54.566Z',
        updated_at: '2022-11-18T09:50:54.760Z',
        admin: true,
        owner: true,
        client: false,
        employee: true,
        time_zone: 'America/Chicago',
        avatar_url: 'https://example.com/avatar.jpg',
        can_manage_projects: true,
        can_manage_people: true,
      },
      lists: [
        {
          id: 1069482092,
          title: 'Triage',
          type: 'Kanban::Triage',
          position: 1,
        },
      ],
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/columns/:id.json`, () => {
    return HttpResponse.json({
      id: 1069482092,
      title: 'Triage',
      type: 'Kanban::Triage',
      cards_count: 1,
      created_at: '2022-11-18T09:51:27.242Z',
      updated_at: '2022-11-18T09:51:41.806Z',
      status: 'active',
      visible_to_clients: false,
      inherits_status: true,
      description: null,
      color: null,
      comment_count: 0,
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/columns/1069482092',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/columns/1069482092.json',
      bookmark_url: 'https://3.basecampapi.com/test',
      cards_url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/lists/1069482092/cards.json',
      parent: {
        id: 1069482091,
        title: 'Card Table',
        type: 'Kanban::Board',
        url: 'https://3.basecampapi.com/test',
        app_url: 'https://3.basecamp.com/test',
      },
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project',
      },
      creator: {
        id: 1049716070,
        attachable_sgid: 'test-sgid',
        name: 'Victor Cooper',
        email_address: 'victor@example.com',
        personable_type: 'User',
        title: 'Chief Strategist',
        bio: 'Test bio',
        location: 'Chicago, IL',
        created_at: '2022-11-18T09:50:54.566Z',
        updated_at: '2022-11-18T09:50:54.760Z',
        admin: true,
        owner: true,
        client: false,
        employee: true,
        time_zone: 'America/Chicago',
        avatar_url: 'https://example.com/avatar.jpg',
        can_manage_projects: true,
        can_manage_people: true,
      },
      subscribers: [],
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/:tableId/columns.json`, () => {
    return HttpResponse.json({
      id: 1069482093,
      title: 'New Column',
      type: 'Kanban::Triage',
      position: 2,
      cards_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/columns/:id.json`, () => {
    return HttpResponse.json({
      id: 1069482092,
      title: 'Updated Title',
      type: 'Kanban::Triage',
      cards_count: 1,
      created_at: '2022-11-18T09:51:27.242Z',
      updated_at: '2022-11-18T09:51:41.806Z',
      status: 'active',
      visible_to_clients: false,
      inherits_status: true,
      description: null,
      color: null,
      comment_count: 0,
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/columns/1069482092',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/columns/1069482092.json',
      bookmark_url: 'https://3.basecampapi.com/test',
      cards_url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/lists/1069482092/cards.json',
      parent: {
        id: 1069482091,
        title: 'Card Table',
        type: 'Kanban::Board',
        url: 'https://3.basecampapi.com/test',
        app_url: 'https://3.basecamp.com/test',
      },
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project',
      },
      creator: {
        id: 1049716070,
        attachable_sgid: 'test-sgid',
        name: 'Victor Cooper',
        email_address: 'victor@example.com',
        personable_type: 'User',
        title: 'Chief Strategist',
        bio: 'Test bio',
        location: 'Chicago, IL',
        created_at: '2022-11-18T09:50:54.566Z',
        updated_at: '2022-11-18T09:50:54.760Z',
        admin: true,
        owner: true,
        client: false,
        employee: true,
        time_zone: 'America/Chicago',
        avatar_url: 'https://example.com/avatar.jpg',
        can_manage_projects: true,
        can_manage_people: true,
      },
      subscribers: [],
    });
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/columns/:id.json`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/columns/:columnId/cards.json`, () => {
    return HttpResponse.json([
      {
        id: 1069482295,
        title: 'New and fancy UI',
        type: 'Kanban::Card',
        position: 1,
        completed: false,
        content: 'Design a new and fancy UI',
        description: 'Design a new and fancy UI',
        due_on: null,
        assignees: [],
        created_at: '2022-11-18T13:42:27.150Z',
        updated_at: '2022-11-18T13:42:27.150Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/cards/:id.json`, () => {
    return HttpResponse.json({
      id: 1069482295,
      title: 'New and fancy UI',
      type: 'Kanban::Card',
      position: 1,
      completed: false,
      content: 'Design a new and fancy UI',
      description: 'Design a new and fancy UI',
      due_on: null,
      assignees: [],
      comments_count: 0,
      comment_count: 0,
      completion_subscribers: [],
      created_at: '2022-11-18T13:42:27.150Z',
      updated_at: '2022-11-18T13:42:27.150Z',
      status: 'active',
      visible_to_clients: false,
      inherits_status: true,
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/cards/1069482295',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/cards/1069482295.json',
      bookmark_url: 'https://3.basecampapi.com/test',
      comments_url: 'https://3.basecampapi.com/test',
      completion_url: 'https://3.basecampapi.com/test',
      subscription_url: 'https://3.basecampapi.com/test',
      parent: {
        id: 1069482092,
        title: 'Triage',
        type: 'Kanban::Triage',
        url: 'https://3.basecampapi.com/test',
        app_url: 'https://3.basecamp.com/test',
      },
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project',
      },
      creator: {
        id: 1049716070,
        attachable_sgid: 'test-sgid',
        name: 'Victor Cooper',
        email_address: 'victor@example.com',
        personable_type: 'User',
        title: 'Chief Strategist',
        bio: 'Test bio',
        location: 'Chicago, IL',
        created_at: '2022-11-18T09:50:54.566Z',
        updated_at: '2022-11-18T09:50:54.760Z',
        admin: true,
        owner: true,
        client: false,
        employee: true,
        time_zone: 'America/Chicago',
        avatar_url: 'https://example.com/avatar.jpg',
        can_manage_projects: true,
        can_manage_people: true,
      },
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/columns/:columnId/cards.json`, () => {
    return HttpResponse.json({
      id: 1069482296,
      title: 'New Card',
      type: 'Kanban::Card',
      position: 1,
      completed: false,
      content: '',
      description: '',
      due_on: null,
      assignees: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/cards/:id.json`, () => {
    return HttpResponse.json({
      id: 1069482295,
      title: 'New and fancy UI',
      type: 'Kanban::Card',
      position: 1,
      completed: false,
      content: 'Design a new and fancy UI',
      description: 'Design a new and fancy UI',
      due_on: null,
      assignees: [],
      comments_count: 0,
      comment_count: 0,
      completion_subscribers: [],
      created_at: '2022-11-18T13:42:27.150Z',
      updated_at: '2022-11-18T13:42:27.150Z',
      status: 'active',
      visible_to_clients: false,
      inherits_status: true,
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/cards/1069482295',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/cards/1069482295.json',
      bookmark_url: 'https://3.basecampapi.com/test',
      comments_url: 'https://3.basecampapi.com/test',
      completion_url: 'https://3.basecampapi.com/test',
      subscription_url: 'https://3.basecampapi.com/test',
      parent: {
        id: 1069482092,
        title: 'Triage',
        type: 'Kanban::Triage',
        url: 'https://3.basecampapi.com/test',
        app_url: 'https://3.basecamp.com/test',
      },
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project',
      },
      creator: {
        id: 1049716070,
        attachable_sgid: 'test-sgid',
        name: 'Victor Cooper',
        email_address: 'victor@example.com',
        personable_type: 'User',
        title: 'Chief Strategist',
        bio: 'Test bio',
        location: 'Chicago, IL',
        created_at: '2022-11-18T09:50:54.566Z',
        updated_at: '2022-11-18T09:50:54.760Z',
        admin: true,
        owner: true,
        client: false,
        employee: true,
        time_zone: 'America/Chicago',
        avatar_url: 'https://example.com/avatar.jpg',
        can_manage_projects: true,
        can_manage_people: true,
      },
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/cards/:id/moves.json`, () => {
    return HttpResponse.json({});
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/card_tables/cards/:id.json`, () => {
    return HttpResponse.json({});
  }),

  // Schedules
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedules/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      title: 'Schedule',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedules/:scheduleId/entries.json`, () => {
    return HttpResponse.json([
      {
        id: 1069479847,
        summary: 'Team Meeting',
        all_day: false,
        starts_at: '2024-01-01T10:00:00Z',
        ends_at: '2024-01-01T11:00:00Z',
        participants: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedule_entries/:id.json`, () => {
    return HttpResponse.json({
      id: 1069479847,
      summary: 'Team Meeting',
      all_day: false,
      starts_at: '2024-01-01T10:00:00Z',
      ends_at: '2024-01-01T11:00:00Z',
      participants: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedules/:scheduleId/entries.json`, () => {
    return HttpResponse.json({
      id: 2,
      summary: 'New Event',
      all_day: false,
      starts_at: '2024-12-25T10:00:00Z',
      ends_at: '2024-12-25T11:00:00Z',
      participants: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedule_entries/:id.json`, () => {
    return HttpResponse.json({
      id: 1069479847,
      summary: 'Updated Meeting',
      all_day: false,
      starts_at: '2024-01-01T10:00:00Z',
      ends_at: '2024-01-01T11:00:00Z',
      participants: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/schedule_entries/:id.json`, () => {
    return HttpResponse.json({});
  }),

  // Recordings
  http.get(`${BASECAMP_API_BASE}/:accountId/projects/recordings.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Recording',
        type: 'Todo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Move todo (reposition)
  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todos/:id/position.json`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:id/status/archived.json`, () => {
    return HttpResponse.json({});
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:id/status/active.json`, () => {
    return HttpResponse.json({});
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:id/status/trashed.json`, () => {
    return HttpResponse.json({});
  }),

  // Events
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/events.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        recording_id: 888,
        action: 'created',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Uploads
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/vaults/:vaultId/uploads.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        filename: 'file.txt',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/uploads/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      filename: 'file.txt',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/vaults/:vaultId/uploads.json`, () => {
    return HttpResponse.json({
      id: 2,
      filename: 'newfile.txt',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/uploads/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      filename: 'updated.txt',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Webhooks
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        payload_url: 'https://example.com/webhook',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      payload_url: 'https://example.com/webhook',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks.json`, () => {
    return HttpResponse.json({
      id: 2,
      payload_url: 'https://example.com/webhook2',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.put(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks/:id.json`, () => {
    return HttpResponse.json({
      id: 1,
      payload_url: 'https://example.com/webhook',
      active: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks/:id.json`, () => {
    return HttpResponse.json({});
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/webhooks/:id/test.json`, () => {
    return HttpResponse.json({});
  }),

  // Todo Groups
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todolists/:todolistId/groups.json`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Group',
        position: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/todolists/:todolistId/groups.json`, () => {
    return HttpResponse.json({
      id: 2,
      name: 'New Group',
      position: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Subscriptions
  http.get(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/subscriptions.json`, () => {
    return HttpResponse.json({
      subscribed: true,
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/subscription.json`, () => {
    return HttpResponse.json({
      subscribed: true,
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.delete(`${BASECAMP_API_BASE}/:accountId/buckets/:projectId/recordings/:recordingId/subscription.json`, () => {
    return HttpResponse.json({});
  }),
  ];
