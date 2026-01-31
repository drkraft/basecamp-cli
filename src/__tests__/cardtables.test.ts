import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCardTable,
  getColumn,
  createColumn,
  updateColumn,
  deleteColumn,
  listCards,
  getCard,
  createCard,
  updateCard,
  moveCard,
  deleteCard
} from '../lib/api.js';

vi.mock('../lib/auth.js', () => ({
  getValidAccessToken: vi.fn().mockResolvedValue('test-token')
}));

vi.mock('../lib/config.js', () => ({
  getCurrentAccountId: vi.fn().mockReturnValue(123456)
}));

const mockProject = {
  id: 2085958499,
  status: 'active',
  created_at: '2022-11-18T09:50:54.566Z',
  updated_at: '2022-11-18T09:50:54.760Z',
  name: 'Test Project',
  description: 'Test Description',
  purpose: 'topic',
  clients_enabled: false,
  bookmark_url: 'https://3.basecampapi.com/test',
  url: 'https://3.basecampapi.com/195539477/projects/2085958499.json',
  app_url: 'https://3.basecamp.com/195539477/projects/2085958499',
  dock: [
    {
      id: 1069482091,
      title: 'Card Table',
      name: 'kanban_board',
      enabled: true,
      position: 1,
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/1069482091.json',
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/1069482091'
    }
  ],
  bookmarked: false
};

const mockCardTable = {
  id: 1069482091,
  status: 'active',
  visible_to_clients: false,
  created_at: '2022-11-18T09:51:27.237Z',
  updated_at: '2022-11-18T09:51:41.811Z',
  title: 'Card Table',
  inherits_status: true,
  type: 'Kanban::Board',
  url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/1069482091.json',
  app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/1069482091',
  bookmark_url: 'https://3.basecampapi.com/test',
  subscription_url: 'https://3.basecampapi.com/test',
  bucket: {
    id: 2085958499,
    name: 'Test Project',
    type: 'Project'
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
    can_manage_people: true
  },
  subscribers: [],
  lists: [
    {
      id: 1069482092,
      status: 'active',
      visible_to_clients: false,
      created_at: '2022-11-18T09:51:27.242Z',
      updated_at: '2022-11-18T09:51:41.806Z',
      title: 'Triage',
      inherits_status: true,
      type: 'Kanban::Triage',
      url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/columns/1069482092.json',
      app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/columns/1069482092',
      bookmark_url: 'https://3.basecampapi.com/test',
      parent: {
        id: 1069482091,
        title: 'Card Table',
        type: 'Kanban::Board',
        url: 'https://3.basecampapi.com/test',
        app_url: 'https://3.basecamp.com/test'
      },
      bucket: {
        id: 2085958499,
        name: 'Test Project',
        type: 'Project'
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
        can_manage_people: true
      },
      description: null,
      subscribers: [],
      color: null,
      cards_count: 1,
      comment_count: 0,
      cards_url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/lists/1069482092/cards.json'
    }
  ]
};

const mockColumn = mockCardTable.lists[0];

const mockCard = {
  id: 1069482295,
  status: 'active',
  visible_to_clients: false,
  created_at: '2022-11-18T13:42:27.150Z',
  updated_at: '2022-11-18T13:42:27.150Z',
  title: 'New and fancy UI',
  inherits_status: true,
  type: 'Kanban::Card',
  url: 'https://3.basecampapi.com/195539477/buckets/2085958499/card_tables/cards/1069482295.json',
  app_url: 'https://3.basecamp.com/195539477/buckets/2085958499/card_tables/cards/1069482295',
  bookmark_url: 'https://3.basecampapi.com/test',
  subscription_url: 'https://3.basecampapi.com/test',
  comments_count: 0,
  comments_url: 'https://3.basecampapi.com/test',
  position: 1,
  parent: {
    id: 1069482092,
    title: 'Triage',
    type: 'Kanban::Triage',
    url: 'https://3.basecampapi.com/test',
    app_url: 'https://3.basecamp.com/test'
  },
  bucket: {
    id: 2085958499,
    name: 'Test Project',
    type: 'Project'
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
    can_manage_people: true
  },
  description: 'Design a new and fancy UI',
  completed: false,
  content: 'Design a new and fancy UI',
  due_on: null,
  assignees: [],
  completion_subscribers: [],
  completion_url: 'https://3.basecampapi.com/test',
  comment_count: 0
};

describe('Card Tables API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getCardTable', () => {
    it('should fetch card table for a project', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProject
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCardTable
        });

      const result = await getCardTable(2085958499);

      expect(result).toEqual(mockCardTable);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error if card table not enabled', async () => {
      const projectWithoutCardTable = {
        ...mockProject,
        dock: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => projectWithoutCardTable
      });

      await expect(getCardTable(2085958499)).rejects.toThrow(
        'Card table (Kanban board) not enabled for this project'
      );
    });
  });

  describe('getColumn', () => {
    it('should fetch a column', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockColumn
      });

      const result = await getColumn(2085958499, 1069482092);

      expect(result).toEqual(mockColumn);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/columns/1069482092.json'),
        expect.any(Object)
      );
    });
  });

  describe('createColumn', () => {
    it('should create a column', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProject
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCardTable
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockColumn
        });

      const result = await createColumn(2085958499, 'New Column', 'Description');

      expect(result).toEqual(mockColumn);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/1069482091/columns.json'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Column', description: 'Description' })
        })
      );
    });
  });

  describe('updateColumn', () => {
    it('should update a column', async () => {
      const updatedColumn = { ...mockColumn, title: 'Updated Title' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedColumn
      });

      const result = await updateColumn(2085958499, 1069482092, { title: 'Updated Title' });

      expect(result).toEqual(updatedColumn);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/columns/1069482092.json'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' })
        })
      );
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await deleteColumn(2085958499, 1069482092);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/columns/1069482092.json'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('listCards', () => {
    it('should list cards in a column', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => [mockCard]
      });

      const result = await listCards(2085958499, 1069482092);

      expect(result).toEqual([mockCard]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/lists/1069482092/cards.json'),
        expect.any(Object)
      );
    });
  });

  describe('getCard', () => {
    it('should fetch a card', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard
      });

      const result = await getCard(2085958499, 1069482295);

      expect(result).toEqual(mockCard);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/cards/1069482295.json'),
        expect.any(Object)
      );
    });
  });

  describe('createCard', () => {
    it('should create a card', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard
      });

      const result = await createCard(2085958499, 1069482092, 'New Card', {
        content: 'Card content',
        due_on: '2024-12-31'
      });

      expect(result).toEqual(mockCard);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/lists/1069482092/cards.json'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'New Card',
            content: 'Card content',
            due_on: '2024-12-31'
          })
        })
      );
    });
  });

  describe('updateCard', () => {
    it('should update a card', async () => {
      const updatedCard = { ...mockCard, title: 'Updated Card' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedCard
      });

      const result = await updateCard(2085958499, 1069482295, { title: 'Updated Card' });

      expect(result).toEqual(updatedCard);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/cards/1069482295.json'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Card' })
        })
      );
    });
  });

  describe('moveCard', () => {
    it('should move a card to another column', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await moveCard(2085958499, 1069482295, 1069482093);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/cards/1069482295/moves.json'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ column_id: 1069482093 })
        })
      );
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await deleteCard(2085958499, 1069482295);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/card_tables/cards/1069482295.json'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });
});
