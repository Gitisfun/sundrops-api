import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class TenantsService extends BaseService {
  constructor() {
    super('tenants');
  }

  // All CRUD operations are now inherited from BaseService:
  // - create(tenantData)
  // - getAll(options)
  // - getById(id)
  // - update(id, updateData)
  // - softDelete(id)
  // - restore(id)
  // - getDeleted(options)
  // - permanentDelete(id)

  // You can add tenant-specific methods here if needed
  // For example:
  // async getByDomain(domain) { ... }
  // async getByStatus(status) { ... }

  /**
   * Get tenants by application ID
   * @param {string} applicationId - The application ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of tenants for the application
   */
  async getByApplicationId(applicationId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at' } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('application_id', applicationId)
        .is('deleted_at', null) // Exclude soft deleted records
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch tenants for application ${applicationId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching tenants for application ${applicationId}: ${error.message}`);
    }
  }

  /**
   * Get deleted tenants by application ID
   * @param {string} applicationId - The application ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of deleted tenants for the application
   */
  async getDeletedByApplicationId(applicationId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'deleted_at' } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('application_id', applicationId)
        .not('deleted_at', 'is', null) // Only get soft deleted records
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch deleted tenants for application ${applicationId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching deleted tenants for application ${applicationId}: ${error.message}`);
    }
  }
}

export default new TenantsService();
