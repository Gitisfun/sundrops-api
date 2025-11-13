import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class UsersService extends BaseService {
  constructor() {
    super('users');
  }

  // All CRUD operations are now inherited from BaseService:
  // - create(userData)
  // - getAll(options)
  // - getById(id)
  // - update(id, updateData)
  // - softDelete(id)
  // - restore(id)
  // - getDeleted(options)
  // - permanentDelete(id)

  // You can add user-specific methods here if needed
  // For example:
  // async getByEmail(email) { ... }
  // async getByApplicationId(applicationId) { ... }
  // async getByStatus(status) { ... }
  // async updateLastLogin(id) { ... }

  /**
   * Get users by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of users for the tenant
   */
  async getByTenantId(tenantId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at' } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null) // Exclude soft deleted records
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch users for tenant ${tenantId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching users for tenant ${tenantId}: ${error.message}`);
    }
  }
}

export default new UsersService();
