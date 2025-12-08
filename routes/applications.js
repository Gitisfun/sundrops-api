import express from 'express';
import applicationsService from '../services/applications.js';
import { validateApplication, validateApplicationUpdate, validateApplicationId } from '../middleware/applications.js';

const router = express.Router();

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications
 *     description: Retrieve all applications excluding soft deleted ones
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of applications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of applications to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of applications retrieved successfully
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
 *                         $ref: '#/components/schemas/Application'
 *                     count:
 *                       type: integer
 *                       description: Number of applications returned
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

    const applications = await applicationsService.getAll(options);
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications/deleted:
 *   get:
 *     summary: Get all soft deleted applications
 *     description: Retrieve all applications that have been soft deleted
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of applications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of applications to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of soft deleted applications retrieved successfully
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
 *                         $ref: '#/components/schemas/Application'
 *                     count:
 *                       type: integer
 *                       description: Number of applications returned
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

    const deletedApplications = await applicationsService.getDeleted(options);
    res.json({
      success: true,
      data: deletedApplications,
      count: deletedApplications.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     description: Retrieve a specific application by its ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         description: Bad request - Application ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
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
router.get('/:id', validateApplicationId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await applicationsService.getById(id);
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new application
 *     description: Create a new application with the provided data
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the application
 *                 example: "Finance App"
 *               key:
 *                 type: string
 *                 description: URL-friendly identifier for the application
 *                 example: "finance-app"
 *               is_multitenant:
 *                 type: boolean
 *                 description: Whether the application supports multiple tenants
 *                 example: true
 *             required:
 *               - name
 *               - key
 *               - is_multitenant
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *                     message:
 *                       type: string
 *                       example: "Application created successfully"
 *       400:
 *         description: Bad request - Application data is required
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
router.post('/', validateApplication, async (req, res, next) => {
  try {
    const applicationData = req.body;

    const newApplication = await applicationsService.create(applicationData);
    res.status(201).json({
      success: true,
      data: newApplication,
      message: 'Application created successfully'
    });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/applications/{id}:
 *   patch:
 *     summary: Update an application by ID
 *     description: Partially update an existing application with the provided data
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the application
 *                 example: "Updated Finance App"
 *               key:
 *                 type: string
 *                 description: URL-friendly identifier for the application
 *                 example: "updated-finance-app"
 *               is_multitenant:
 *                 type: boolean
 *                 description: Whether the application supports multiple tenants
 *                 example: true
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *                     message:
 *                       type: string
 *                       example: "Application updated successfully"
 *       400:
 *         description: Bad request - Application ID or update data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
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
router.patch('/:id', validateApplicationId, validateApplicationUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedApplication = await applicationsService.update(id, updateData);
    res.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Soft delete an application by ID
 *     description: Soft delete an application by setting its deleted_at timestamp
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *                     message:
 *                       type: string
 *                       example: "Application soft deleted successfully"
 *       400:
 *         description: Bad request - Application ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
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
router.delete('/:id', validateApplicationId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedApplication = await applicationsService.softDelete(id);
    res.json({
      success: true,
      data: deletedApplication,
      message: 'Application soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications/{id}/restore:
 *   post:
 *     summary: Restore a soft deleted application by ID
 *     description: Restore a soft deleted application by clearing its deleted_at timestamp
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *                     message:
 *                       type: string
 *                       example: "Application restored successfully"
 *       400:
 *         description: Bad request - Application ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
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
router.post('/:id/restore', validateApplicationId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const restoredApplication = await applicationsService.restore(id);
    res.json({
      success: true,
      data: restoredApplication,
      message: 'Application restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/applications/{id}/permanent:
 *   delete:
 *     summary: Permanently delete an application by ID
 *     description: Permanently delete an application from the database (cannot be restored)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Application permanently deleted successfully"
 *                     deletedData:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         description: Bad request - Application ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
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
router.delete('/:id/permanent', validateApplicationId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await applicationsService.permanentDelete(id);
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
