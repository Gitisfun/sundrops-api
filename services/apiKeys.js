import BaseService from './base.js';
import crypto from 'crypto';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class ApiKeysService extends BaseService {
  constructor() {
    super('api_keys');
  }

  /**
   * Generate a new API key
   * @returns {string} Generated API key
   */
  generateApiKey() {
    // Generate a secure random API key
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Create a new API key
   * @param {Object} data - API key data (name, application_id, etc.)
   * @returns {Promise<Object>} Created API key with the generated key
   */
  async create(data) {
    const apiKey = this.generateApiKey();
    
    const keyData = {
      ...data,
      key: apiKey,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await super.create(keyData);
  }

  /**
   * Get API key by key value
   * @param {string} key - The API key string
   * @returns {Promise<Object>} The API key record
   */
  async getByKey(key) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select('*')
        .eq('key', key)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound('API key not found');
        }
        throw ApiError.internal(`Failed to fetch API key: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching API key: ${error.message}`);
    }
  }

  /**
   * Get all API keys with application and tenant information
   * @param {Object} options - Query options (limit, offset, orderBy, tenant_id)
   * @returns {Promise<Array>} Array of API keys with application and tenant names
   */
  async getAllWithApplication(options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', tenant_id } = options;
      
      // Build query with joins for application and tenant
      let query = dbClient
        .from(this.tableName)
        .select(`
          *,
          applications (
            id,
            name
          ),
          tenants (
            id,
            name
          )
        `)
        .is('deleted_at', null);

      // Filter by tenant_id if provided
      if (tenant_id) {
        query = query.eq('tenant_id', tenant_id);
      }

      const { data, error } = await query
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw ApiError.internal(`Failed to fetch API keys: ${error.message}`);
      }

      // Transform the data to flatten the application and tenant names
      const transformedData = (data || []).map(apiKey => {
        const application = apiKey.applications;
        const tenant = apiKey.tenants;
        const applicationName = application?.name || null;
        const applicationId = application?.id || null;
        const tenantName = tenant?.name || null;
        const tenantId = tenant?.id || null;

        // Create a clean object without the nested properties
        const { applications, tenants, ...rest } = apiKey;
        
        return {
          ...rest,
          application_name: applicationName,
          application: application ? {
            id: application.id,
            name: application.name
          } : null,
          tenant_name: tenantName,
          tenant: tenant ? {
            id: tenant.id,
            name: tenant.name
          } : null
        };
      });

      return transformedData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching API keys: ${error.message}`);
    }
  }

  /**
   * Get API keys by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of API keys for the tenant
   */
  async getByTenantId(tenantId, options = {}) {
    try {
      const optionsWithTenant = { ...options, tenant_id: tenantId };
      return await this.getAllWithApplication(optionsWithTenant);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching API keys for tenant ${tenantId}: ${error.message}`);
    }
  }
}

export default new ApiKeysService();
