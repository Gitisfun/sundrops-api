import express from 'express';
import usersService from '../services/users.js';
import ApiError from '../errors/errors.js';
import { validateUser, validateUserUpdate, validateUserId } from '../middleware/users.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users excluding soft deleted ones, including their assigned roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           user_roles:
 *                             type: array
 *                             description: List of roles assigned to this user
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                   description: User role assignment ID
 *                                 role_id:
 *                                   type: string
 *                                   format: uuid
 *                                   description: Role ID
 *                                 roles:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                       example: "Admin"
 *                 count:
 *                   type: integer
 *                   description: Number of users returned
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const users = await usersService.getAll(options);
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
 * /api/users/deleted:
 *   get:
 *     summary: Get all soft deleted users
 *     description: Retrieve all users that have been soft deleted
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of soft deleted users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     count:
 *                       type: integer
 *                       description: Number of users returned
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/deleted', async (req, res, next) => {
  try {
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const deletedUsers = await usersService.getDeleted(options);
    res.json({
      success: true,
      data: deletedUsers,
      count: deletedUsers.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by its ID, including their assigned roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         user_roles:
 *                           type: array
 *                           description: List of roles assigned to this user
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 description: User role assignment ID
 *                               role_id:
 *                                 type: string
 *                                 format: uuid
 *                                 description: Role ID
 *                               roles:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "Admin"
 *       400:
 *         description: Bad request - User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw ApiError.badRequest('User ID is required');
    }

    const user = await usersService.getById(id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tenant this user belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               application_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the application this user belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed using bcrypt before storage)
 *                 example: "SecurePassword123!"
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               status:
 *                 type: string
 *                 description: User's status
 *                 example: "active"
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *                     message:
 *                       type: string
 *                       example: "User created successfully"
 *       400:
 *         description: Bad request - User data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateUser, async (req, res, next) => {
  try {
    const userData = req.body;

    const newUser = await usersService.create(userData);
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     description: Partially update an existing user with the provided data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tenant this user belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               application_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the application this user belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed using bcrypt before storage)
 *                 example: "NewSecurePassword123!"
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               status:
 *                 type: string
 *                 description: User's status
 *                 example: "active"
 *               last_login_at:
 *                 type: string
 *                 format: date-time
 *                 description: Last login timestamp
 *                 example: "2023-12-01T10:30:00Z"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *                     message:
 *                       type: string
 *                       example: "User updated successfully"
 *       400:
 *         description: Bad request - User ID or update data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', validateUserId, validateUserUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      throw ApiError.badRequest('Update data is required');
    }

    const updatedUser = await usersService.update(id, updateData);
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Soft delete a user by ID
 *     description: Soft delete a user by setting its deleted_at timestamp
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *                     message:
 *                       type: string
 *                       example: "User soft deleted successfully"
 *       400:
 *         description: Bad request - User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw ApiError.badRequest('User ID is required');
    }

    const deletedUser = await usersService.softDelete(id);
    res.json({
      success: true,
      data: deletedUser,
      message: 'User soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/restore:
 *   post:
 *     summary: Restore a soft deleted user by ID
 *     description: Restore a soft deleted user by clearing its deleted_at timestamp
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *                     message:
 *                       type: string
 *                       example: "User restored successfully"
 *       400:
 *         description: Bad request - User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/restore', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw ApiError.badRequest('User ID is required');
    }

    const restoredUser = await usersService.restore(id);
    res.json({
      success: true,
      data: restoredUser,
      message: 'User restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a user by ID
 *     description: Permanently delete a user from the database (cannot be restored)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User permanently deleted successfully"
 *                     deletedData:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/permanent', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw ApiError.badRequest('User ID is required');
    }

    const result = await usersService.permanentDelete(id);
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
 * /api/users/tenant/{tenantId}:
 *   get:
 *     summary: Get users by tenant ID
 *     description: Retrieve all users for a specific tenant, including their assigned roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search string to filter users by email, username, first name, or last name (case-insensitive)
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of users for the tenant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           user_roles:
 *                             type: array
 *                             description: List of roles assigned to this user
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                   description: User role assignment ID
 *                                 role_id:
 *                                   type: string
 *                                   format: uuid
 *                                   description: Role ID
 *                                 roles:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                       example: "Admin"
 *                 count:
 *                   type: integer
 *                   description: Number of users returned
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/users/tenant/{tenantId}/deleted:
 *   get:
 *     summary: Get deleted users by tenant ID
 *     description: Retrieve all soft deleted users for a specific tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by (defaults to deleted_at)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search string to filter users by email, username, first name, or last name (case-insensitive)
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of deleted users for the tenant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     count:
 *                       type: integer
 *                       description: Number of users returned
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tenant/:tenantId/deleted', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { limit, offset, orderBy, search } = req.query;
    
    if (!tenantId) {
      throw ApiError.badRequest('Tenant ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined,
      search: search || undefined
    };

    const deletedUsers = await usersService.getDeletedByTenantId(tenantId, options);
    res.json({
      success: true,
      data: deletedUsers,
      count: deletedUsers.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tenant/:tenantId', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { limit, offset, orderBy, search } = req.query;
    
    if (!tenantId) {
      throw ApiError.badRequest('Tenant ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined,
      search: search || undefined
    };

    const users = await usersService.getByTenantId(tenantId, options);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
