import BaseService from './base.js';
import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';
import bcrypt from 'bcrypt';

class UsersService extends BaseService {
  constructor() {
    super('users');
  }

  // All CRUD operations are now inherited from BaseService:
  // - getAll(options)
  // - getById(id)
  // - update(id, updateData)
  // - softDelete(id)
  // - restore(id)
  // - getDeleted(options)
  // - permanentDelete(id)
  
  // Override create method to hash password
  /**
   * Create a new user with password hashing
   * @param {Object} userData - The user data (should include 'password' field)
   * @returns {Promise<Object>} The created user
   */
  async create(userData) {
    try {
      // Extract password from userData
      const { password, email, username, ...restData } = userData;

      // Validate that password is provided
      if (!password) {
        throw ApiError.badRequest('Password is required');
      }

      // Check if email already exists (case-insensitive, excluding soft-deleted users)
      if (email) {
        const { data: existingEmailUsers, error: emailError } = await dbClient
          .from(this.tableName)
          .select('id, email')
          .ilike('email', email)
          .is('deleted_at', null)
          .limit(1);

        if (emailError) {
          throw ApiError.internal(`Failed to check email uniqueness: ${emailError.message}`);
        }

        if (existingEmailUsers && existingEmailUsers.length > 0) {
          throw ApiError.badRequest('Email already exists');
        }
      }

      // Check if username already exists (case-insensitive, excluding soft-deleted users)
      if (username) {
        const { data: existingUsernameUsers, error: usernameError } = await dbClient
          .from(this.tableName)
          .select('id, username')
          .ilike('username', username)
          .is('deleted_at', null)
          .limit(1);

        if (usernameError) {
          throw ApiError.internal(`Failed to check username uniqueness: ${usernameError.message}`);
        }

        if (existingUsernameUsers && existingUsernameUsers.length > 0) {
          throw ApiError.badRequest('Username already exists');
        }
      }

      // Hash the password using bcrypt
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user data with hashed password
      const userDataWithHash = {
        ...restData,
        email,
        username,
        password_hash
      };

      // Call parent create method
      return await super.create(userDataWithHash);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error creating user: ${error.message}`);
    }
  }

  /**
   * Update a user with password hashing support
   * @param {string|number} id - The user ID
   * @param {Object} updateData - The data to update (can include 'password' field)
   * @returns {Promise<Object>} The updated user
   */
  async update(id, updateData) {
    try {
      // Extract password, email, and username from updateData if present
      const { password, email, username, ...restData } = updateData;

      // Check if email already exists (case-insensitive, excluding soft-deleted users and current user)
      if (email) {
        const { data: existingEmailUsers, error: emailError } = await dbClient
          .from(this.tableName)
          .select('id, email')
          .ilike('email', email)
          .is('deleted_at', null)
          .neq('id', id)
          .limit(1);

        if (emailError) {
          throw ApiError.internal(`Failed to check email uniqueness: ${emailError.message}`);
        }

        if (existingEmailUsers && existingEmailUsers.length > 0) {
          throw ApiError.badRequest('Email already exists');
        }
      }

      // Check if username already exists (case-insensitive, excluding soft-deleted users and current user)
      if (username) {
        const { data: existingUsernameUsers, error: usernameError } = await dbClient
          .from(this.tableName)
          .select('id, username')
          .ilike('username', username)
          .is('deleted_at', null)
          .neq('id', id)
          .limit(1);

        if (usernameError) {
          throw ApiError.internal(`Failed to check username uniqueness: ${usernameError.message}`);
        }

        if (existingUsernameUsers && existingUsernameUsers.length > 0) {
          throw ApiError.badRequest('Username already exists');
        }
      }

      // If password is provided, hash it
      if (password) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        restData.password_hash = password_hash;
      }

      // Add email and username back to restData if they were provided
      const finalUpdateData = {
        ...restData,
        ...(email && { email }),
        ...(username && { username })
      };

      // Call parent update method
      return await super.update(id, finalUpdateData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error updating user: ${error.message}`);
    }
  }

  /**
   * Find a user by email or username and tenant ID for authentication
   * @param {string} identifier - Email or username
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<Object|null>} The user if found, null otherwise
   */
  async findByEmailOrUsernameAndTenant(identifier, tenantId) {
    try {
      if (!identifier || !tenantId) {
        return null;
      }

      // Find by email or username (case-insensitive) for the specific tenant
      // Using OR filter with ilike for case-insensitive matching
      const identifierLower = identifier.toLowerCase();
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .or(`email.ilike.${identifierLower},username.ilike.${identifierLower}`)
        .limit(1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to find user: ${error.message}`);
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error finding user: ${error.message}`);
    }
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches, false otherwise
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw ApiError.internal(`Error verifying password: ${error.message}`);
    }
  }

  /**
   * Update last login timestamp for a user
   * @param {string|number} id - The user ID
   * @returns {Promise<Object>} The updated user
   */
  async updateLastLogin(id) {
    try {
      return await this.update(id, { last_login_at: new Date().toISOString() });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error updating last login: ${error.message}`);
    }
  }

  /**
   * Get users by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy, search)
   * @returns {Promise<Array>} Array of users for the tenant
   */
  async getByTenantId(tenantId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', search } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null); // Exclude soft deleted records

      // Add search functionality if search string is provided
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchPattern = `%${searchTerm}%`;
        // Use OR filter to search across multiple fields (case-insensitive)
        query = query.or(`email.ilike.${searchPattern},username.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`);
      }

      query = query
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

  /**
   * Get deleted users by tenant ID
   * @param {string} tenantId - The tenant ID
   * @param {Object} options - Query options (limit, offset, orderBy, search)
   * @returns {Promise<Array>} Array of deleted users for the tenant
   */
  async getDeletedByTenantId(tenantId, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'deleted_at', search } = options;
      
      let query = dbClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .not('deleted_at', 'is', null); // Only get soft deleted records

      // Add search functionality if search string is provided
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchPattern = `%${searchTerm}%`;
        // Use OR filter to search across multiple fields (case-insensitive)
        query = query.or(`email.ilike.${searchPattern},username.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`);
      }

      query = query
        .order(orderBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw ApiError.internal(`Failed to fetch deleted users for tenant ${tenantId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching deleted users for tenant ${tenantId}: ${error.message}`);
    }
  }
}

export default new UsersService();
