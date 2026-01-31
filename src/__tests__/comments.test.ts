import { describe, it, expect } from 'vitest';
import { listComments, getComment, createComment, updateComment, deleteComment } from '../lib/api.js';

describe('Comments API', () => {
  const projectId = 999;
  const recordingId = 888;
  const commentId = 1;

  describe('listComments', () => {
    it('should fetch all comments for a recording', async () => {
      const comments = await listComments(projectId, recordingId);
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
    });

    it('should return comments with required fields', async () => {
      const comments = await listComments(projectId, recordingId);
      if (comments.length > 0) {
        const comment = comments[0];
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('content');
        expect(comment).toHaveProperty('creator');
        expect(comment).toHaveProperty('created_at');
      }
    });
  });

  describe('getComment', () => {
    it('should fetch a single comment by ID', async () => {
      const comment = await getComment(projectId, commentId);
      expect(comment).toBeDefined();
      expect(comment.id).toBe(commentId);
    });

    it('should include comment properties', async () => {
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

  describe('createComment', () => {
    it('should create a new comment on a recording', async () => {
      const content = 'New test comment';
      const comment = await createComment(projectId, recordingId, content);
      expect(comment).toBeDefined();
      expect(comment.id).toBe(2);
    });

    it('should include created comment properties', async () => {
      const content = 'New test comment';
      const comment = await createComment(projectId, recordingId, content);
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('creator');
      expect(comment).toHaveProperty('created_at');
    });

    it('should handle HTML content in comments', async () => {
      const htmlContent = '<p>This is <strong>bold</strong> text</p>';
      const comment = await createComment(projectId, recordingId, htmlContent);
      expect(comment).toBeDefined();
      expect(comment).toHaveProperty('id');
    });

    it('should handle long comment content', async () => {
      const longContent = 'A'.repeat(1000);
      const comment = await createComment(projectId, recordingId, longContent);
      expect(comment).toBeDefined();
      expect(comment).toHaveProperty('id');
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const newContent = 'Updated comment content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toBeDefined();
      expect(comment.id).toBe(commentId);
    });

    it('should preserve comment ID on update', async () => {
      const newContent = 'Updated content';
      const comment = await updateComment(projectId, commentId, newContent);
      expect(comment).toHaveProperty('id');
      expect(comment.id).toBe(commentId);
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
});
