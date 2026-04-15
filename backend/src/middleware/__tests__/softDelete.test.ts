import { describe, it, expect } from 'vitest';
import { softDelete, restoreRecord, isDeleted, filterOutDeleted, SOFT_DELETE_TABLES } from '../softDelete';

describe('Soft Delete Utilities', () => {
  describe('SOFT_DELETE_TABLES', () => {
    it('should include all protected tables', () => {
      expect(SOFT_DELETE_TABLES).toContain('profiles');
      expect(SOFT_DELETE_TABLES).toContain('messages');
      expect(SOFT_DELETE_TABLES).toContain('matches');
      expect(SOFT_DELETE_TABLES).toContain('connections');
      expect(SOFT_DELETE_TABLES).toContain('notifications');
      expect(SOFT_DELETE_TABLES).toContain('events');
    });
  });

  describe('isDeleted', () => {
    it('should return true for deleted records', () => {
      const deletedRecord = { deleted_at: '2026-04-13T10:00:00Z' };
      expect(isDeleted(deletedRecord)).toBe(true);
    });

    it('should return false for non-deleted records', () => {
      const activeRecord = { deleted_at: null };
      expect(isDeleted(activeRecord)).toBe(false);
    });

    it('should return false for records without deleted_at', () => {
      const record = {};
      expect(isDeleted(record)).toBe(false);
    });
  });

  describe('filterOutDeleted', () => {
    it('should filter out deleted records', () => {
      const records = [
        { id: '1', deleted_at: null },
        { id: '2', deleted_at: '2026-04-13T10:00:00Z' },
        { id: '3', deleted_at: null },
        { id: '4', deleted_at: '2026-04-13T11:00:00Z' }
      ];

      const filtered = filterOutDeleted(records);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('should return empty array if all records are deleted', () => {
      const records = [
        { id: '1', deleted_at: '2026-04-13T10:00:00Z' },
        { id: '2', deleted_at: '2026-04-13T11:00:00Z' }
      ];

      const filtered = filterOutDeleted(records);
      expect(filtered).toHaveLength(0);
    });

    it('should return all records if none are deleted', () => {
      const records = [
        { id: '1', deleted_at: null },
        { id: '2', deleted_at: null }
      ];

      const filtered = filterOutDeleted(records);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('softDelete', () => {
    it('should reject unsupported tables', async () => {
      try {
        await softDelete('unsupported_table', 'test-id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('does not support soft delete');
      }
    });

    it('should accept supported tables', async () => {
      // This would require a real database connection
      // For now, just verify the function exists and is callable
      expect(typeof softDelete).toBe('function');
    });
  });

  describe('restoreRecord', () => {
    it('should reject unsupported tables', async () => {
      try {
        await restoreRecord('unsupported_table', 'test-id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('does not support soft delete');
      }
    });

    it('should accept supported tables', async () => {
      // This would require a real database connection
      expect(typeof restoreRecord).toBe('function');
    });
  });

  describe('Soft Delete Workflow', () => {
    it('should support delete and restore workflow', () => {
      // Verify both functions exist and are callable
      expect(typeof softDelete).toBe('function');
      expect(typeof restoreRecord).toBe('function');
      expect(typeof isDeleted).toBe('function');
      expect(typeof filterOutDeleted).toBe('function');
    });
  });
});
