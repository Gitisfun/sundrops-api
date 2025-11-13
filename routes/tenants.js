import express from 'express';
import tenantsService from '../services/tenants.js';
import ApiError from '../errors/errors.js';

const router = express.Router();

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants
 *     description: Retrieve all tenants excluding soft deleted ones
 *     tags: [Tenants]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of tenants to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of tenants to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of tenants retrieved successfully
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
 *                         $ref: '#/components/schemas/Tenant'
 *                     count:
 *                       type: integer
 *                       description: Number of tenants returned
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

    const tenants = await tenantsService.getAll(options);
    res.json({
      success: true,
      data: tenants,
      count: tenants.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/deleted:
 *   get:
 *     summary: Get all soft deleted tenants
 *     description: Retrieve all tenants that have been soft deleted
 *     tags: [Tenants]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of tenants to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of tenants to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of soft deleted tenants retrieved successfully
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
 *                         $ref: '#/components/schemas/Tenant'
 *                     count:
 *                       type: integer
 *                       description: Number of tenants returned
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

    const deletedTenants = await tenantsService.getDeleted(options);
    res.json({
      success: true,
      data: deletedTenants,
      count: deletedTenants.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     description: Retrieve a specific tenant by its ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tenant not found
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
      throw ApiError.badRequest('Tenant ID is required');
    }

    const tenant = await tenantsService.getById(id);
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant
 *     description: Create a new tenant with the provided data
 *     tags: [Tenants]
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
 *                 description: ID of the application this tenant belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               name:
 *                 type: string
 *                 description: Name of the tenant
 *                 example: "Acme Corporation"
 *               domain:
 *                 type: string
 *                 description: Unique domain for the tenant
 *                 example: "acme.example.com"
 *               status:
 *                 type: string
 *                 description: Status of the tenant
 *                 example: "active"
 *             required:
 *               - application_id
 *               - name
 *               - domain
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *                     message:
 *                       type: string
 *                       example: "Tenant created successfully"
 *       400:
 *         description: Bad request - Tenant data is required
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
router.post('/', async (req, res, next) => {
  try {
    const tenantData = req.body;

    if (!tenantData || Object.keys(tenantData).length === 0) {
      throw ApiError.badRequest('Tenant data is required');
    }

    const newTenant = await tenantsService.create(tenantData);
    res.status(201).json({
      success: true,
      data: newTenant,
      message: 'Tenant created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   patch:
 *     summary: Update a tenant by ID
 *     description: Partially update an existing tenant with the provided data
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
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
 *                 description: ID of the application this tenant belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               name:
 *                 type: string
 *                 description: Name of the tenant
 *                 example: "Updated Acme Corporation"
 *               domain:
 *                 type: string
 *                 description: Unique domain for the tenant
 *                 example: "updated-acme.example.com"
 *               status:
 *                 type: string
 *                 description: Status of the tenant
 *                 example: "inactive"
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *                     message:
 *                       type: string
 *                       example: "Tenant updated successfully"
 *       400:
 *         description: Bad request - Tenant ID or update data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tenant not found
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
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw ApiError.badRequest('Tenant ID is required');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw ApiError.badRequest('Update data is required');
    }

    const updatedTenant = await tenantsService.update(id, updateData);
    res.json({
      success: true,
      data: updatedTenant,
      message: 'Tenant updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     summary: Soft delete a tenant by ID
 *     description: Soft delete a tenant by setting its deleted_at timestamp
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *                     message:
 *                       type: string
 *                       example: "Tenant soft deleted successfully"
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tenant not found
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
      throw ApiError.badRequest('Tenant ID is required');
    }

    const deletedTenant = await tenantsService.softDelete(id);
    res.json({
      success: true,
      data: deletedTenant,
      message: 'Tenant soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/{id}/restore:
 *   post:
 *     summary: Restore a soft deleted tenant by ID
 *     description: Restore a soft deleted tenant by clearing its deleted_at timestamp
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *                     message:
 *                       type: string
 *                       example: "Tenant restored successfully"
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tenant not found
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
      throw ApiError.badRequest('Tenant ID is required');
    }

    const restoredTenant = await tenantsService.restore(id);
    res.json({
      success: true,
      data: restoredTenant,
      message: 'Tenant restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a tenant by ID
 *     description: Permanently delete a tenant from the database (cannot be restored)
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Tenant permanently deleted successfully"
 *                     deletedData:
 *                       $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Bad request - Tenant ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tenant not found
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
      throw ApiError.badRequest('Tenant ID is required');
    }

    const result = await tenantsService.permanentDelete(id);
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
 * /api/tenants/application/{applicationId}/deleted:
 *   get:
 *     summary: Get deleted tenants by application ID
 *     description: Retrieve all soft deleted tenants for a specific application
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of tenants to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of tenants to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of deleted tenants for the application retrieved successfully
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
 *                         $ref: '#/components/schemas/Tenant'
 *                     count:
 *                       type: integer
 *                       description: Number of tenants returned
 *       400:
 *         description: Bad request - Application ID is required
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
router.get('/application/:applicationId/deleted', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { limit, offset, orderBy } = req.query;
    
    if (!applicationId) {
      throw ApiError.badRequest('Application ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const deletedTenants = await tenantsService.getDeletedByApplicationId(applicationId, options);
    res.json({
      success: true,
      data: deletedTenants,
      count: deletedTenants.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tenants/application/{applicationId}:
 *   get:
 *     summary: Get tenants by application ID
 *     description: Retrieve all tenants for a specific application
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of tenants to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of tenants to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of tenants for the application retrieved successfully
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
 *                         $ref: '#/components/schemas/Tenant'
 *                     count:
 *                       type: integer
 *                       description: Number of tenants returned
 *       400:
 *         description: Bad request - Application ID is required
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
router.get('/application/:applicationId', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { limit, offset, orderBy } = req.query;
    
    if (!applicationId) {
      throw ApiError.badRequest('Application ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const tenants = await tenantsService.getByApplicationId(applicationId, options);
    res.json({
      success: true,
      data: tenants,
      count: tenants.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
