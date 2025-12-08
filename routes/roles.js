import express from 'express';
import rolesService from '../services/roles.js';
import ApiError from '../errors/errors.js';
import { validateRole, validateRoleUpdate, validateRoleId } from '../middleware/roles.js';

const router = express.Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve all roles excluding soft deleted ones
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of roles to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of roles to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const roles = await rolesService.getAll(options);
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
 * /api/roles/deleted:
 *   get:
 *     summary: Get all soft deleted roles
 *     description: Retrieve all roles that have been soft deleted
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of soft deleted roles retrieved successfully
 */
router.get('/deleted', async (req, res, next) => {
  try {
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const deletedRoles = await rolesService.getDeleted(options);
    res.json({
      success: true,
      data: deletedRoles,
      count: deletedRoles.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/tenant/{tenantId}:
 *   get:
 *     summary: Get roles by tenant ID
 *     description: Retrieve all roles for a specific tenant
 *     tags: [Roles]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search string to filter roles by name or description
 *     responses:
 *       200:
 *         description: List of roles for the tenant retrieved successfully
 */
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

    const roles = await rolesService.getByTenantId(tenantId, options);
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
 * /api/roles/tenant/{tenantId}/deleted:
 *   get:
 *     summary: Get deleted roles by tenant ID
 *     description: Retrieve all soft deleted roles for a specific tenant
 *     tags: [Roles]
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
 *     responses:
 *       200:
 *         description: List of deleted roles for the tenant retrieved successfully
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

    const deletedRoles = await rolesService.getDeletedByTenantId(tenantId, options);
    res.json({
      success: true,
      data: deletedRoles,
      count: deletedRoles.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/application/{applicationId}:
 *   get:
 *     summary: Get roles by application ID
 *     description: Retrieve all roles for a specific application
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: List of roles for the application retrieved successfully
 */
router.get('/application/:applicationId', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { limit, offset, orderBy, search } = req.query;
    
    if (!applicationId) {
      throw ApiError.badRequest('Application ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined,
      search: search || undefined
    };

    const roles = await rolesService.getByApplicationId(applicationId, options);
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
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve a specific role by its ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 */
router.get('/:id', validateRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await rolesService.getById(id);
    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role with the provided data
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               application_id:
 *                 type: string
 *                 format: uuid
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_system:
 *                 type: boolean
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post('/', validateRole, async (req, res, next) => {
  try {
    const roleData = req.body;

    const newRole = await rolesService.create(roleData);
    res.status(201).json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   patch:
 *     summary: Update a role by ID
 *     description: Partially update an existing role with the provided data
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_system:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 */
router.patch('/:id', validateRoleId, validateRoleUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      throw ApiError.badRequest('Update data is required');
    }

    const updatedRole = await rolesService.update(id, updateData);
    res.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Soft delete a role by ID
 *     description: Soft delete a role by setting its deleted_at timestamp
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role soft deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete('/:id', validateRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedRole = await rolesService.softDelete(id);
    res.json({
      success: true,
      data: deletedRole,
      message: 'Role soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/{id}/restore:
 *   post:
 *     summary: Restore a soft deleted role by ID
 *     description: Restore a soft deleted role by clearing its deleted_at timestamp
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role restored successfully
 *       404:
 *         description: Role not found
 */
router.post('/:id/restore', validateRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const restoredRole = await rolesService.restore(id);
    res.json({
      success: true,
      data: restoredRole,
      message: 'Role restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/roles/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a role by ID
 *     description: Permanently delete a role from the database (cannot be restored)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permanently deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete('/:id/permanent', validateRoleId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await rolesService.permanentDelete(id);
    res.json({
      success: true,
      message: result.message,
      deletedData: result.deletedData
    });
  } catch (error) {
    next(error);
  }
});

export default router;
