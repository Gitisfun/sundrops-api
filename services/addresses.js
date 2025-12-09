import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class AddressesService extends BaseService {
  constructor() {
    super('addresses');
  }

  /**
   * Create a new address for a user
   * @param {string} userId - The user ID
   * @param {Object} addressData - The address data
   * @returns {Promise<Object>} The created address
   */
  async createForUser(userId, addressData) {
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

      // Create address with user_id
      return await super.create({
        ...addressData,
        user_id: userId
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error creating address: ${error.message}`);
    }
  }

  /**
   * Get all addresses for a user (excluding soft deleted)
   * @param {string} userId - The user ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of addresses
   */
  async getByUserId(userId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at' } = options;

      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw ApiError.internal(`Failed to fetch addresses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching addresses: ${error.message}`);
    }
  }

  /**
   * Get a specific address for a user
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @returns {Promise<Object>} The address
   */
  async getByUserIdAndId(userId, addressId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Address with ID ${addressId} not found for user ${userId}`);
        }
        throw ApiError.internal(`Failed to fetch address: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching address: ${error.message}`);
    }
  }

  /**
   * Update an address for a user
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated address
   */
  async updateForUser(userId, addressId, updateData) {
    try {
      // Verify address belongs to user
      await this.getByUserIdAndId(userId, addressId);

      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to update address: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error updating address: ${error.message}`);
    }
  }

  /**
   * Soft delete an address for a user
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @returns {Promise<Object>} The soft deleted address
   */
  async softDeleteForUser(userId, addressId) {
    try {
      // Verify address belongs to user
      await this.getByUserIdAndId(userId, addressId);

      const deletedAt = new Date().toISOString();

      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: deletedAt,
          updated_at: deletedAt
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to soft delete address: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error soft deleting address: ${error.message}`);
    }
  }

  /**
   * Restore a soft deleted address for a user
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @returns {Promise<Object>} The restored address
   */
  async restoreForUser(userId, addressId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Soft deleted address with ID ${addressId} not found for user ${userId}`);
        }
        throw ApiError.internal(`Failed to restore address: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error restoring address: ${error.message}`);
    }
  }

  /**
   * Get all soft deleted addresses for a user
   * @param {string} userId - The user ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of soft deleted addresses
   */
  async getDeletedByUserId(userId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'deleted_at' } = options;

      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw ApiError.internal(`Failed to fetch deleted addresses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching deleted addresses: ${error.message}`);
    }
  }

  /**
   * Permanently delete an address for a user
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async permanentDeleteForUser(userId, addressId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Address with ID ${addressId} not found for user ${userId}`);
        }
        throw ApiError.internal(`Failed to permanently delete address: ${error.message}`);
      }

      return { message: `Address with ID ${addressId} permanently deleted`, deletedData: data };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error permanently deleting address: ${error.message}`);
    }
  }
}

export default new AddressesService();
