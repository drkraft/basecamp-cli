import { describe, it, expect } from 'vitest';
import * as api from '../lib/api.js';

describe('Documents API Functions', () => {
  describe('Function exports', () => {
    it('should export listDocuments function', () => {
      expect(typeof api.listDocuments).toBe('function');
    });

    it('should export getDocument function', () => {
      expect(typeof api.getDocument).toBe('function');
    });

    it('should export createDocument function', () => {
      expect(typeof api.createDocument).toBe('function');
    });

    it('should export updateDocument function', () => {
      expect(typeof api.updateDocument).toBe('function');
    });
  });

  describe('Function signatures', () => {
    it('listDocuments should accept projectId and vaultId', () => {
      const fn = api.listDocuments;
      expect(fn.length).toBe(2);
    });

    it('getDocument should accept projectId and documentId', () => {
      const fn = api.getDocument;
      expect(fn.length).toBe(2);
    });

    it('createDocument should accept projectId, vaultId, title, content, and optional status', () => {
      const fn = api.createDocument;
      expect(fn.length).toBe(5);
    });

    it('updateDocument should accept projectId, documentId, and updates', () => {
      const fn = api.updateDocument;
      expect(fn.length).toBe(3);
    });
  });

  describe('Function return types', () => {
    it('listDocuments should return a Promise', () => {
      const result = api.listDocuments(1, 1);
      expect(result instanceof Promise).toBe(true);
    });

    it('getDocument should return a Promise', () => {
      const result = api.getDocument(1, 1);
      expect(result instanceof Promise).toBe(true);
    });

    it('createDocument should return a Promise', () => {
      const result = api.createDocument(1, 1, 'Test Doc', '<p>Content</p>');
      expect(result instanceof Promise).toBe(true);
    });

    it('updateDocument should return a Promise', () => {
      const result = api.updateDocument(1, 1, { title: 'Updated' });
      expect(result instanceof Promise).toBe(true);
    });
  });
});
