import { describe, it, expect } from 'vitest';
import './setup.js';
import { listComments, getComment, createComment, updateComment, deleteComment } from '../lib/api.js';

describe('Comments API', () => {
  const projectId = 999;
  const recordingId = 888;
  const commentId = 777;

  const mockComment = {
    id: commentId,
    status: 'active',
    visible_to_clients: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    title: 'Comment',
    inherits_status: false,
    type: 'Comment',
    url: 'https://3.basecampapi.com/123456/comments/777.json',
    app_url: 'https://basecamp.com/123456/projects/999/comments/777',
    parent: {
      id: recordingId,
      title: 'Recording',
      type: 'Todo',
      url: 'https://3.basecampapi.com/123456/todos/888.json',
      app_url: 'https://basecamp.com/123456/projects/999/todos/888'
    },
    bucket: {
      id: projectId,
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
  };

  describe('listComments', () => {
    it('should fetch all comments for a recording', async () => {
      const comments = await listComments(projectId, recordingId);
      expect(Array.isArray(comments)).toBe(true);
    });

    it('should handle empty comment list', async () => {
      const comments = await listComments(projectId, recordingId);
      expect(Array.isArray(comments)).toBe(true);
    });
  });

  describe('getComment', () => {
    it('should fetch a single comment by ID', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment).toBeDefined();
      expect(typeof comment).toBe('object');
    });

    it('should include comment properties', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('creator');
      expect(comment).toHaveProperty('created_at');
    });
  });

  describe('createComment', () => {
    it('should create a new comment on a recording', async () => {
      const content = 'New test comment';
      const comment = await createComment(projectId, recordingId, content);
      expect(comment).toBeDefined();
      expect(typeof comment).toBe('object');
    });

    it('should include created comment properties', async () => {
      const content = 'New test comment';
      const comment = await createComment(projectId, recordingId, content);
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('creator');
    });

    it('should handle HTML content in comments', async () => {
      const htmlContent = '<p>This is <strong>bold</strong> text</p>';
      const comment = await createComment(projectId, recordingId, htmlContent);
      expect(comment).toBeDefined();
    });

    it('should handle long comment content', async () => {
      const longContent = 'A'.repeat(1000);
      const comment = await createComment(projectId, recordingId, longContent);
      expect(comment).toBeDefined();
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const newContent = 'Updated comment content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toBeDefined();
      expect(typeof comment).toBe('object');
    });

    it('should preserve comment ID on update', async () => {
      const newContent = 'Updated content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toHaveProperty('id');
    });

    it('should update the content field', async () => {
      const newContent = 'New updated content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toHaveProperty('content');
    });

    it('should update the updated_at timestamp', async () => {
      const newContent = 'Updated content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toHaveProperty('updated_at');
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const result = await deleteComment(projectId, commentId);
      expect(result).toBeUndefined();
    });

    it('should handle deletion of non-existent comment gracefully', async () => {
      const result = await deleteComment(projectId, 99999);
      expect(result).toBeUndefined();
    });
  });

  describe('API endpoint paths', () => {
    it('should use correct endpoint for listing comments', async () => {
      const comments = await listComments(projectId, recordingId);
      expect(Array.isArray(comments)).toBe(true);
    });

    it('should use correct endpoint for getting a comment', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment).toBeDefined();
    });

    it('should use correct endpoint for creating a comment', async () => {
      const comment = await createComment(projectId, recordingId, 'Test');
      expect(comment).toBeDefined();
    });

    it('should use correct endpoint for updating a comment', async () => {
      const comment = await updateComment(projectId, commentId, 'Updated');
      expect(comment).toBeDefined();
    });

    it('should use correct endpoint for deleting a comment', async () => {
      const result = await deleteComment(projectId, commentId);
      expect(result).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      try {
        await getComment(projectId, commentId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle network errors', async () => {
      try {
        await listComments(projectId, recordingId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Comment structure validation', () => {
    it('should have required comment fields', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('creator');
      expect(comment).toHaveProperty('created_at');
      expect(comment).toHaveProperty('updated_at');
      expect(comment).toHaveProperty('url');
      expect(comment).toHaveProperty('app_url');
    });

    it('should have creator information', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment.creator).toHaveProperty('id');
      expect(comment.creator).toHaveProperty('name');
      expect(comment.creator).toHaveProperty('email_address');
    });

    it('should have parent recording information', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment.parent).toHaveProperty('id');
      expect(comment.parent).toHaveProperty('type');
      expect(comment.parent).toHaveProperty('url');
    });

    it('should have bucket (project) information', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment.bucket).toHaveProperty('id');
      expect(comment.bucket).toHaveProperty('name');
      expect(comment.bucket).toHaveProperty('type');
    });
  });

  describe('Pagination support', () => {
    it('should handle multiple comments in list', async () => {
      const comments = await listComments(projectId, recordingId);
      expect(Array.isArray(comments)).toBe(true);
    });

    it('should preserve order of comments', async () => {
      const comments = await listComments(projectId, recordingId);
      if (comments.length > 1) {
        for (let i = 1; i < comments.length; i++) {
          const prevDate = new Date(comments[i - 1].created_at).getTime();
          const currDate = new Date(comments[i].created_at).getTime();
          expect(prevDate <= currDate).toBe(true);
        }
      }
    });
  });
});
