import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class BaseService {
  constructor(tableName) {
    if (!tableName) {
      throw new Error('Table name is required for BaseService');
    }
    this.tableName = tableName;
  }

  /**
   * Create a new record
   * @param {Object} data - The data to create
   * @returns {Promise<Object>} The created record
   */
  async create(data) {
    try {
      const { data: result, error } = await dbClient
        .from(this.tableName)
        .insert([data])
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to create ${this.tableName} record: ${error.message}`);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error creating ${this.tableName} record: ${error.message}`);
    }
  }

  /**
   * Get all records (excluding soft deleted)
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of records
   */
  async getAll(options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at' } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .is('deleted_at', null) // Exclude soft deleted records
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch ${this.tableName} records: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching ${this.tableName} records: ${error.message}`);
    }
  }

  /**
   * Get record by ID (excluding soft deleted)
   * @param {string|number} id - The record ID
   * @returns {Promise<Object>} The record data
   */
  async getById(id) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`${this.tableName} record with ID ${id} not found`);
        }
        throw ApiError.internal(`Failed to fetch ${this.tableName} record: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching ${this.tableName} record: ${error.message}`);
    }
  }

  /**
   * Update a record by ID
   * @param {string|number} id - The record ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated record
   */
  async update(id, updateData) {
    try {
      await this.getById(id);

      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to update ${this.tableName} record: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error updating ${this.tableName} record: ${error.message}`);
    }
  }

  /**
   * Soft delete a record by ID
   * @param {string|number} id - The record ID
   * @returns {Promise<Object>} The soft deleted record
   */
  async softDelete(id) {
    try {
      // First check if the record exists and is not already soft deleted
      await this.getById(id);

      const deletedAt = new Date().toISOString();
      
      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: deletedAt,
          updated_at: deletedAt
        })
        .eq('id', id)
        .is('deleted_at', null) // Only soft delete non-deleted records
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to soft delete ${this.tableName} record: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error soft deleting ${this.tableName} record: ${error.message}`);
    }
  }

  /**
   * Restore a soft deleted record by ID
   * @param {string|number} id - The record ID
   * @returns {Promise<Object>} The restored record
   */
  async restore(id) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .not('deleted_at', 'is', null) // Only restore soft deleted records
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`Soft deleted ${this.tableName} record with ID ${id} not found`);
        }
        throw ApiError.internal(`Failed to restore ${this.tableName} record: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error restoring ${this.tableName} record: ${error.message}`);
    }
  }

  /**
   * Get all soft deleted records
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of soft deleted records
   */
  async getDeleted(options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'deleted_at' } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .not('deleted_at', 'is', null) // Only get soft deleted records
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch deleted ${this.tableName} records: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching deleted ${this.tableName} records: ${error.message}`);
    }
  }

  /**
   * Permanently delete a record by ID (hard delete)
   * @param {string|number} id - The record ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async permanentDelete(id) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`${this.tableName} record with ID ${id} not found`);
        }
        throw ApiError.internal(`Failed to permanently delete ${this.tableName} record: ${error.message}`);
      }

      return { message: `${this.tableName} record with ID ${id} permanently deleted`, deletedData: data };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error permanently deleting ${this.tableName} record: ${error.message}`);
    }
  }
}

export default BaseService;
