import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class RolesService extends BaseService {
  constructor() {
    super('roles');
  }

  /**
   * Get roles by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy, search)
   * @returns {Promise<Array>} Array of roles for the tenant
   */
  async getByTenantId(tenantId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', search } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null);

      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      query = query
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch roles for tenant ${tenantId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching roles for tenant ${tenantId}: ${error.message}`);
    }
  }

  /**
   * Get deleted roles by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy, search)
   * @returns {Promise<Array>} Array of deleted roles for the tenant
   */
  async getDeletedByTenantId(tenantId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'deleted_at', search } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .not('deleted_at', 'is', null);

      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      query = query
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch deleted roles for tenant ${tenantId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching deleted roles for tenant ${tenantId}: ${error.message}`);
    }
  }

  /**
   * Get roles by application ID
   * @param {string} applicationId - The application ID
   * @param {Object} options - Query options (limit, offset, orderBy, search)
   * @returns {Promise<Array>} Array of roles for the application
   */
  async getByApplicationId(applicationId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', search } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('application_id', applicationId)
        .is('deleted_at', null);

      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      query = query
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch roles for application ${applicationId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching roles for application ${applicationId}: ${error.message}`);
    }
  }

  /**
   * Check if a role name already exists for a tenant
   * @param {string} name - The role name
   * @param {string} tenantId - The tenant ID
   * @param {string} excludeId - Optional ID to exclude (for updates)
   * @returns {Promise<boolean>} True if name exists, false otherwise
   */
  async nameExistsForTenant(name, tenantId, excludeId = null) {
    try {
      let query = dbClient
        .from(this.tableName)
        .select('id')
        .eq('tenant_id', tenantId)
        .ilike('name', name)
        .is('deleted_at', null)
        .limit(1);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to check role name uniqueness: ${error.message}`);
      }

      return data && data.length > 0;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error checking role name uniqueness: ${error.message}`);
    }
  }
}

export default new RolesService();
