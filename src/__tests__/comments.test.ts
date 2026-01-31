import { describe, it, expect } from 'vitest';
import * as api from '../lib/api.js';

describe('Comments API Functions', () => {
  describe('Function exports', () => {
    it('should export listComments function', () => {
      expect(typeof api.listComments).toBe('function');
    });

    it('should export getComment function', () => {
      expect(typeof api.getComment).toBe('function');
    });

    it('should export createComment function', () => {
      expect(typeof api.createComment).toBe('function');
    });

    it('should export updateComment function', () => {
      expect(typeof api.updateComment).toBe('function');
    });

    it('should export deleteComment function', () => {
      expect(typeof api.deleteComment).toBe('function');
    });
  });

  describe('Function signatures', () => {
    it('listComments should accept projectId and recordingId', () => {
      const fn = api.listComments;
      expect(fn.length).toBe(2);
    });

    it('getComment should accept projectId and commentId', () => {
      const fn = api.getComment;
      expect(fn.length).toBe(2);
    });

    it('createComment should accept projectId, recordingId, and content', () => {
      const fn = api.createComment;
      expect(fn.length).toBe(3);
    });

    it('updateComment should accept projectId, commentId, and content', () => {
      const fn = api.updateComment;
      expect(fn.length).toBe(3);
    });

    it('deleteComment should accept projectId and commentId', () => {
      const fn = api.deleteComment;
      expect(fn.length).toBe(2);
    });
  });

  describe('Function return types', () => {
    it('listComments should return a Promise', () => {
      const result = api.listComments(1, 1);
      expect(result instanceof Promise).toBe(true);
    });

    it('getComment should return a Promise', () => {
      const result = api.getComment(1, 1);
      expect(result instanceof Promise).toBe(true);
    });

    it('createComment should return a Promise', () => {
      const result = api.createComment(1, 1, 'test');
      expect(result instanceof Promise).toBe(true);
    });

    it('updateComment should return a Promise', () => {
      const result = api.updateComment(1, 1, 'test');
      expect(result instanceof Promise).toBe(true);
    });

    it('deleteComment should return a Promise', () => {
      const result = api.deleteComment(1, 1);
      expect(result instanceof Promise).toBe(true);
    });
  });
});
