import { dbClient } from '../config/supabase.js';
import ApiError from '../errors/errors.js';

class UserRolesService {
  constructor() {
    this.tableName = 'user_roles';
  }

  /**
   * Assign a role to a user
   * @param {Object} data - The data containing user_id and role_id
   * @returns {Promise<Object>} The created user role assignment
   */
  async create(data) {
    try {
      // Check if assignment already exists
      const exists = await this.exists(data.user_id, data.role_id);
      if (exists) {
        throw ApiError.badRequest('User already has this role assigned');
      }

      const { data: result, error } = await dbClient
        .from(this.tableName)
        .insert([data])
        .select()
        .single();

      if (error) {
        throw ApiError.internal(`Failed to assign role to user: ${error.message}`);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error assigning role to user: ${error.message}`);
    }
  }

  /**
   * Remove a role from a user
   * @param {string} userId - The user ID
   * @param {string} roleId - The role ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async delete(userId, roleId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound('User role assignment not found');
        }
        throw ApiError.internal(`Failed to remove role from user: ${error.message}`);
      }

      return { message: 'Role removed from user successfully', deletedData: data };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error removing role from user: ${error.message}`);
    }
  }

  /**
   * Delete a user role assignment by ID
   * @param {string} id - The user role assignment ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async deleteById(id) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound('User role assignment not found');
        }
        throw ApiError.internal(`Failed to delete user role assignment: ${error.message}`);
      }

      return { message: 'User role assignment deleted successfully', deletedData: data };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error deleting user role assignment: ${error.message}`);
    }
  }

  /**
   * Get all roles for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of role assignments with role details
   */
  async getRolesByUserId(userId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select(`
          *,
          roles (*)
        `)
        .eq('user_id', userId);

      if (error) {
        throw ApiError.internal(`Failed to fetch roles for user ${userId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching roles for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Get all users for a role
   * @param {string} roleId - The role ID
   * @returns {Promise<Array>} Array of user role assignments with user details
   */
  async getUsersByRoleId(roleId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select(`
          *,
          users (*)
        `)
        .eq('role_id', roleId);

      if (error) {
        throw ApiError.internal(`Failed to fetch users for role ${roleId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching users for role ${roleId}: ${error.message}`);
    }
  }

  /**
   * Check if a user has a specific role
   * @param {string} userId - The user ID
   * @param {string} roleId - The role ID
   * @returns {Promise<boolean>} True if the user has the role, false otherwise
   */
  async exists(userId, roleId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .limit(1);

      if (error) {
        throw ApiError.internal(`Failed to check user role: ${error.message}`);
      }

      return data && data.length > 0;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error checking user role: ${error.message}`);
    }
  }

  /**
   * Get user role assignment by ID
   * @param {string} id - The user role assignment ID
   * @returns {Promise<Object>} The user role assignment
   */
  async getById(id) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .select(`
          *,
          roles (*),
          users (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw ApiError.notFound(`User role assignment with ID ${id} not found`);
        }
        throw ApiError.internal(`Failed to fetch user role assignment: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching user role assignment: ${error.message}`);
    }
  }

  /**
   * Get all user role assignments
   * @param {Object} options - Query options (limit, offset)
   * @returns {Promise<Array>} Array of user role assignments
   */
  async getAll(options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;

      const { data, error } = await dbClient
        .from(this.tableName)
        .select(`
          *,
          roles (*),
          users (*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw ApiError.internal(`Failed to fetch user role assignments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error fetching user role assignments: ${error.message}`);
    }
  }

  /**
   * Remove all roles from a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async removeAllRolesFromUser(userId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) {
        throw ApiError.internal(`Failed to remove all roles from user: ${error.message}`);
      }

      return { 
        message: 'All roles removed from user successfully', 
        count: data ? data.length : 0,
        deletedData: data 
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error removing all roles from user: ${error.message}`);
    }
  }

  /**
   * Remove all users from a role
   * @param {string} roleId - The role ID
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async removeAllUsersFromRole(roleId) {
    try {
      const { data, error } = await dbClient
        .from(this.tableName)
        .delete()
        .eq('role_id', roleId)
        .select();

      if (error) {
        throw ApiError.internal(`Failed to remove all users from role: ${error.message}`);
      }

      return { 
        message: 'All users removed from role successfully', 
        count: data ? data.length : 0,
        deletedData: data 
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Unexpected error removing all users from role: ${error.message}`);
    }
  }
}

export default new UserRolesService();
