/**
 * Soft Delete Middleware and Utilities
 * Ensures data is never permanently deleted, only marked as deleted
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { SoftDeletable } from '../types/domain';

// Tables that support soft delete
export const SOFT_DELETE_TABLES = [
  'profiles',
  'messages',
  'matches',
  'connections',
  'notifications',
  'events',
  'event_participants',
  'favorites',
  'v_dates',
  'success_stories'
];

/**
 * Soft delete a record instead of hard delete
 * @param table - The table name
 * @param id - The record ID
 * @returns The updated record with deleted_at set
 */
export async function softDelete<T extends SoftDeletable>(
  table: string,
  id: string
): Promise<{ data: T | null; error: unknown }> {
  if (!SOFT_DELETE_TABLES.includes(table)) {
    throw new Error(`Table ${table} does not support soft delete`);
  }

  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data: data as T | null, error };
}

/**
 * Permanently delete a record (admin only, use with caution)
 * @param table - The table name
 * @param id - The record ID
 * @param reason - Reason for permanent deletion (for audit)
 */
export async function hardDelete<T extends SoftDeletable>(
  table: string,
  id: string,
  reason: string
): Promise<{ data: T | null; error: unknown }> {
  // Log the hard delete for audit purposes
  logger.warn(`[Hard Delete] Table: ${table}, ID: ${id}, Reason: ${reason}`);

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
    .single();

  return { data: data as T | null, error };
}

/**
 * Restore a soft-deleted record
 * @param table - The table name
 * @param id - The record ID
 */
export async function restoreRecord<T extends SoftDeletable>(
  table: string,
  id: string
): Promise<{ data: T | null; error: unknown }> {
  if (!SOFT_DELETE_TABLES.includes(table)) {
    throw new Error(`Table ${table} does not support soft delete`);
  }

  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single();

  return { data: data as T | null, error };
}

/**
 * Query builder helper that automatically filters out soft-deleted records
 * @param query - The Supabase query builder
 * @returns The query builder with deleted_at filter applied
 */
export function filterDeleted<T>(query: any): any {
  return query.is('deleted_at', null);
}

/**
 * Middleware to prevent hard deletes on protected tables
 */
export function preventHardDelete(req: Request, res: Response, next: NextFunction): void {
  // Check if this is a DELETE request
  if (req.method !== 'DELETE') {
    next();
    return;
  }

  // Extract table name from URL (simplified - adjust based on your routing)
  const tableMatch = req.path.match(/^\/api\/(\w+)/);
  const table = tableMatch?.[1];

  if (table && SOFT_DELETE_TABLES.includes(table)) {
    // Convert DELETE to a soft delete by changing the method and body
    req.method = 'PATCH';
    req.body = { deleted_at: new Date().toISOString() };
    
    // Log the soft delete
    logger.info(`[Soft Delete] Converted hard delete to soft delete for ${table}`);
  }

  next();
}

/**
 * Check if a record is soft-deleted
 * @param record - The record to check
 */
export function isDeleted(record: SoftDeletable): boolean {
  return record.deleted_at !== null && record.deleted_at !== undefined;
}

/**
 * Get only non-deleted records from an array
 * @param records - Array of records
 */
export function filterOutDeleted<T extends SoftDeletable>(records: T[]): T[] {
  return records.filter(record => !isDeleted(record));
}