import { describe, it, expect } from 'vitest';
import * as api from '../lib/api.js';

describe('Vaults API Functions', () => {
  describe('Function exports', () => {
    it('should export getVault function', () => {
      expect(typeof api.getVault).toBe('function');
    });

    it('should export listVaults function', () => {
      expect(typeof api.listVaults).toBe('function');
    });

    it('should export createVault function', () => {
      expect(typeof api.createVault).toBe('function');
    });

    it('should export updateVault function', () => {
      expect(typeof api.updateVault).toBe('function');
    });
  });

  describe('Function signatures', () => {
    it('getVault should accept projectId and vaultId', () => {
      const fn = api.getVault;
      expect(fn.length).toBe(2);
    });

    it('listVaults should accept projectId and optional parentVaultId', () => {
      const fn = api.listVaults;
      expect(fn.length).toBe(2);
    });

    it('createVault should accept projectId, parentVaultId, and title', () => {
      const fn = api.createVault;
      expect(fn.length).toBe(3);
    });

    it('updateVault should accept projectId, vaultId, and title', () => {
      const fn = api.updateVault;
      expect(fn.length).toBe(3);
    });
  });

  describe('Function return types', () => {
    it('getVault should return a Promise', () => {
      const result = api.getVault(1, 1);
      expect(result instanceof Promise).toBe(true);
    });

    it('listVaults should return a Promise', () => {
      const result = api.listVaults(1);
      expect(result instanceof Promise).toBe(true);
    });

    it('createVault should return a Promise', () => {
      const result = api.createVault(1, 1, 'Test Vault');
      expect(result instanceof Promise).toBe(true);
    });

    it('updateVault should return a Promise', () => {
      const result = api.updateVault(1, 1, 'Updated Vault');
      expect(result instanceof Promise).toBe(true);
    });
  });
});
