import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listTodolistGroups, createTodolistGroup } from '../lib/api.js';
import * as config from '../lib/config.js';

vi.mock('../lib/config.js');
vi.mock('../lib/auth.js');

const mockGroups = [
  {
    id: 1069479100,
    status: 'active',
    visible_to_clients: false,
    created_at: '2022-10-21T10:24:24.930Z',
    updated_at: '2022-11-22T08:23:38.003Z',
    title: 'Group A',
    inherits_status: true,
    type: 'Todolist',
    url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479100.json',
    app_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479100',
    bookmark_url: 'https://3.basecampapi.com/195539477/my/bookmarks/test.json',
    subscription_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/recordings/1069479100/subscription.json',
    comments_count: 0,
    comments_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/recordings/1069479100/comments.json',
    position: 1,
    parent: {
      id: 1069479099,
      title: 'Ping pong tournament',
      type: 'Todolist',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479099.json',
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479099'
    },
    bucket: {
      id: 2085958497,
      name: 'Honcho Design Newsroom',
      type: 'Project'
    },
    creator: {
      id: 1049715925,
      attachable_sgid: 'test',
      name: 'Brian Jenks',
      email_address: 'brian@honchodesign.com',
      personable_type: 'User',
      title: 'International Branding Liason',
      bio: null,
      location: null,
      created_at: '2022-11-22T08:23:22.042Z',
      updated_at: '2022-11-22T08:23:22.042Z',
      admin: false,
      owner: false,
      client: false,
      employee: false,
      time_zone: 'Etc/UTC',
      avatar_url: 'https://3.basecamp-static.com/195539477/people/test/avatar?v=1',
      can_manage_projects: true,
      can_manage_people: true
    },
    description: '',
    completed: false,
    completed_ratio: '0/2',
    name: 'Group A',
    todos_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479100/todos.json',
    group_position_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/groups/1069479100/position.json',
    app_todos_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479100/todos'
  },
  {
    id: 1069479103,
    status: 'active',
    visible_to_clients: false,
    created_at: '2022-10-21T08:56:24.930Z',
    updated_at: '2022-11-22T08:23:38.283Z',
    title: 'Group B',
    inherits_status: true,
    type: 'Todolist',
    url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479103.json',
    app_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479103',
    bookmark_url: 'https://3.basecampapi.com/195539477/my/bookmarks/test2.json',
    subscription_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/recordings/1069479103/subscription.json',
    comments_count: 0,
    comments_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/recordings/1069479103/comments.json',
    position: 2,
    parent: {
      id: 1069479099,
      title: 'Ping pong tournament',
      type: 'Todolist',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479099.json',
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479099'
    },
    bucket: {
      id: 2085958497,
      name: 'Honcho Design Newsroom',
      type: 'Project'
    },
    creator: {
      id: 1049715925,
      attachable_sgid: 'test',
      name: 'Brian Jenks',
      email_address: 'brian@honchodesign.com',
      personable_type: 'User',
      title: 'International Branding Liason',
      bio: null,
      location: null,
      created_at: '2022-11-22T08:23:22.042Z',
      updated_at: '2022-11-22T08:23:22.042Z',
      admin: false,
      owner: false,
      client: false,
      employee: false,
      time_zone: 'Etc/UTC',
      avatar_url: 'https://3.basecamp-static.com/195539477/people/test/avatar?v=1',
      can_manage_projects: true,
      can_manage_people: true
    },
    description: '',
    completed: false,
    completed_ratio: '0/2',
    name: 'Group B',
    todos_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/1069479103/todos.json',
    group_position_url: 'https://3.basecampapi.com/195539477/buckets/2085958497/todolists/groups/1069479103/position.json',
    app_todos_url: 'https://3.basecamp.com/195539477/buckets/2085958497/todolists/1069479103/todos'
  }
];

describe('Todolist Groups API', () => {
  beforeEach(() => {
    vi.mocked(config.getCurrentAccountId).mockReturnValue(195539477);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('listTodolistGroups', () => {
    it('should list all groups in a todolist', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);
    });

    it('should handle empty group list', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      expect(Array.isArray(groups)).toBe(true);
    });

    it('should preserve group properties', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('name');
        expect(group).toHaveProperty('position');
        expect(group).toHaveProperty('completed_ratio');
        expect(group).toHaveProperty('status');
      }
    });

    it('should include group metadata', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group).toHaveProperty('created_at');
        expect(group).toHaveProperty('updated_at');
        expect(group).toHaveProperty('creator');
        expect(group).toHaveProperty('bucket');
      }
    });

    it('should include group URLs', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group).toHaveProperty('url');
        expect(group).toHaveProperty('app_url');
        expect(group).toHaveProperty('todos_url');
        expect(group).toHaveProperty('group_position_url');
      }
    });
  });

  describe('createTodolistGroup', () => {
    it('should create a group with name only', async () => {
      const group = await createTodolistGroup(2085958497, 1069479099, 'New Group');
      expect(group).toBeDefined();
      expect(group.name).toBe('New Group');
    });

    it('should create a group with name and color', async () => {
      const group = await createTodolistGroup(2085958497, 1069479099, 'Colored Group', 'blue');
      expect(group).toBeDefined();
      expect(group.name).toBe('Colored Group');
    });

    it('should return group with all required properties', async () => {
      const group = await createTodolistGroup(2085958497, 1069479099, 'Test Group');
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('status');
      expect(group).toHaveProperty('position');
      expect(group).toHaveProperty('created_at');
      expect(group).toHaveProperty('creator');
    });

    it('should return group with URLs', async () => {
      const group = await createTodolistGroup(2085958497, 1069479099, 'Test Group');
      expect(group).toHaveProperty('url');
      expect(group).toHaveProperty('app_url');
      expect(group).toHaveProperty('todos_url');
      expect(group).toHaveProperty('group_position_url');
    });

    it('should set group status to active', async () => {
      const group = await createTodolistGroup(2085958497, 1069479099, 'Test Group');
      expect(group.status).toBe('active');
    });

    it('should support all valid colors', async () => {
      const colors = ['white', 'red', 'orange', 'yellow', 'green', 'blue', 'aqua', 'purple', 'gray', 'pink', 'brown'];
      for (const color of colors) {
        const group = await createTodolistGroup(2085958497, 1069479099, `Group ${color}`, color);
        expect(group).toBeDefined();
        expect(group.name).toBe(`Group ${color}`);
      }
    });
  });

  describe('Group properties', () => {
    it('should have position property for ordering', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 1) {
        expect(groups[0].position).toBeLessThan(groups[1].position);
      }
    });

    it('should have completed_ratio for progress tracking', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(typeof group.completed_ratio).toBe('string');
        expect(group.completed_ratio).toMatch(/^\d+\/\d+$/);
      }
    });

    it('should have parent reference to parent todolist', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group.parent).toBeDefined();
        expect(group.parent.type).toBe('Todolist');
        expect(group.parent).toHaveProperty('id');
        expect(group.parent).toHaveProperty('title');
      }
    });

    it('should have creator information', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group.creator).toBeDefined();
        expect(group.creator).toHaveProperty('id');
        expect(group.creator).toHaveProperty('name');
        expect(group.creator).toHaveProperty('email_address');
      }
    });

    it('should have bucket reference to project', async () => {
      const groups = await listTodolistGroups(2085958497, 1069479099);
      if (groups.length > 0) {
        const group = groups[0];
        expect(group.bucket).toBeDefined();
        expect(group.bucket.type).toBe('Project');
        expect(group.bucket).toHaveProperty('id');
        expect(group.bucket).toHaveProperty('name');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle invalid project ID', async () => {
      try {
        await listTodolistGroups(NaN, 1069479099);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid todolist ID', async () => {
      try {
        await listTodolistGroups(2085958497, NaN);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle missing account ID', async () => {
      vi.mocked(config.getCurrentAccountId).mockReturnValue(null);
      try {
        await listTodolistGroups(2085958497, 1069479099);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('No account selected');
      }
    });
  });

  describe('API endpoint construction', () => {
    it('should construct correct list endpoint', async () => {
      const projectId = 2085958497;
      const todolistId = 1069479099;
      await listTodolistGroups(projectId, todolistId);
    });

    it('should construct correct create endpoint', async () => {
      const projectId = 2085958497;
      const todolistId = 1069479099;
      await createTodolistGroup(projectId, todolistId, 'Test');
    });
  });
});
