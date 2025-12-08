import express from 'express';
import userRolesService from '../services/userRoles.js';
import ApiError from '../errors/errors.js';
import { validateUserRole, validateUserRoleId, validateUserId, validateRoleIdParam } from '../middleware/userRoles.js';

const router = express.Router();

/**
 * @swagger
 * /api/user-roles:
 *   get:
 *     summary: Get all user role assignments
 *     description: Retrieve all user role assignments
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of assignments to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of assignments to skip
 *     responses:
 *       200:
 *         description: List of user role assignments retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };

    const userRoles = await userRolesService.getAll(options);
    res.json({
      success: true,
      data: userRoles,
      count: userRoles.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/{id}:
 *   get:
 *     summary: Get user role assignment by ID
 *     description: Retrieve a specific user role assignment by its ID
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User role assignment ID
 *     responses:
 *       200:
 *         description: User role assignment retrieved successfully
 *       404:
 *         description: User role assignment not found
 */
router.get('/:id', validateUserRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const userRole = await userRolesService.getById(id);
    res.json({
      success: true,
      data: userRole
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/user/{userId}:
 *   get:
 *     summary: Get all roles for a user
 *     description: Retrieve all role assignments for a specific user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of roles for the user retrieved successfully
 */
router.get('/user/:userId', validateUserId, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const roles = await userRolesService.getRolesByUserId(userId);
    res.json({
      success: true,
      data: roles,
      count: roles.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/role/{roleId}:
 *   get:
 *     summary: Get all users for a role
 *     description: Retrieve all user assignments for a specific role
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of users for the role retrieved successfully
 */
router.get('/role/:roleId', validateRoleIdParam, async (req, res, next) => {
  try {
    const { roleId } = req.params;

    const users = await userRolesService.getUsersByRoleId(roleId);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles:
 *   post:
 *     summary: Assign a role to a user
 *     description: Create a new user role assignment
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: The user ID to assign the role to
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 description: The role ID to assign
 *             required:
 *               - user_id
 *               - role_id
 *     responses:
 *       201:
 *         description: Role assigned to user successfully
 *       400:
 *         description: User already has this role assigned
 */
router.post('/', validateUserRole, async (req, res, next) => {
  try {
    const userRoleData = req.body;

    const newUserRole = await userRolesService.create(userRoleData);
    res.status(201).json({
      success: true,
      data: newUserRole,
      message: 'Role assigned to user successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/{id}:
 *   delete:
 *     summary: Delete a user role assignment by ID
 *     description: Remove a user role assignment by its ID
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User role assignment ID
 *     responses:
 *       200:
 *         description: User role assignment deleted successfully
 *       404:
 *         description: User role assignment not found
 */
router.delete('/:id', validateUserRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userRolesService.deleteById(id);
    res.json({
      success: true,
      message: result.message,
      deletedData: result.deletedData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/user/{userId}/role/{roleId}:
 *   delete:
 *     summary: Remove a specific role from a user
 *     description: Remove a role from a user by user ID and role ID
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 *       404:
 *         description: User role assignment not found
 */
router.delete('/user/:userId/role/:roleId', validateUserId, validateRoleIdParam, async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;

    const result = await userRolesService.delete(userId, roleId);
    res.json({
      success: true,
      message: result.message,
      deletedData: result.deletedData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/user/{userId}/all:
 *   delete:
 *     summary: Remove all roles from a user
 *     description: Remove all role assignments from a specific user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: All roles removed from user successfully
 */
router.delete('/user/:userId/all', validateUserId, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await userRolesService.removeAllRolesFromUser(userId);
    res.json({
      success: true,
      message: result.message,
      count: result.count,
      deletedData: result.deletedData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/role/{roleId}/all:
 *   delete:
 *     summary: Remove all users from a role
 *     description: Remove all user assignments from a specific role
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: All users removed from role successfully
 */
router.delete('/role/:roleId/all', validateRoleIdParam, async (req, res, next) => {
  try {
    const { roleId } = req.params;

    const result = await userRolesService.removeAllUsersFromRole(roleId);
    res.json({
      success: true,
      message: result.message,
      count: result.count,
      deletedData: result.deletedData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/check:
 *   get:
 *     summary: Check if a user has a specific role
 *     description: Check if a user-role assignment exists
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: role_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Check result returned successfully
 */
router.get('/check', async (req, res, next) => {
  try {
    const { user_id, role_id } = req.query;

    if (!user_id || !role_id) {
      throw ApiError.badRequest('Both user_id and role_id are required');
    }

    const hasRole = await userRolesService.exists(user_id, role_id);
    res.json({
      success: true,
      data: {
        user_id,
        role_id,
        has_role: hasRole
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
