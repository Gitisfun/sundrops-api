import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class ContactService extends BaseService {
  constructor() {
    super('contact');
  }

  /**
   * Upsert contact for a user (create or update)
   * @param {string} userId - The user ID
   * @param {Object} contactData - The contact data
   * @returns {Promise<Object>} The created or updated contact
   */
  async upsertForUser(userId, contactData) {
    try {
      // Verify user exists
      const { data: user, error: userError } = await dbClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (userError || !user) {
        throw ApiError.notFound(`User with ID ${userId} not found`);
      }

      // Upsert contact with user_id as the conflict target
      const { data, error } = await dbClient
        .from(this.tableName)
        .upsert(
          {
            ...contactData,
            user_id: userId,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to upsert contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error upserting contact: ${error.message}`);
    }
  }

  /**
   * Get contact for a user (excluding soft deleted)
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>} The contact or null
   */
  async getByUserId(userId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw ApiError.internal(`Failed to fetch contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching contact: ${error.message}`);
    }
  }

  /**
   * Update contact for a user
   * @param {string} userId - The user ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated contact
   */
  async updateForUser(userId, updateData) {
    try {
      // Verify contact exists for user
      const existing = await this.getByUserId(userId);
      if (!existing) {
        throw ApiError.notFound(`Contact for user ${userId} not found`);
      }

      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to update contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error updating contact: ${error.message}`);
    }
  }

  /**
   * Soft delete contact for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The soft deleted contact
   */
  async softDeleteForUser(userId) {
    try {
      // Verify contact exists for user
      const existing = await this.getByUserId(userId);
      if (!existing) {
        throw ApiError.notFound(`Contact for user ${userId} not found`);
      }

      const deletedAt = new Date().toISOString();

      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: deletedAt,
          updated_at: deletedAt
        })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to soft delete contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error soft deleting contact: ${error.message}`);
    }
  }

  /**
   * Restore a soft deleted contact for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The restored contact
   */
  async restoreForUser(userId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Soft deleted contact for user ${userId} not found`);
        }
        throw ApiError.internal(`Failed to restore contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error restoring contact: ${error.message}`);
    }
  }

  /**
   * Permanently delete contact for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async permanentDeleteForUser(userId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Contact for user ${userId} not found`);
        }
        throw ApiError.internal(`Failed to permanently delete contact: ${error.message}`);
      }

      return { message: `Contact for user ${userId} permanently deleted`, deletedData: data };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error permanently deleting contact: ${error.message}`);
    }
  }
}

export default new ContactService();
