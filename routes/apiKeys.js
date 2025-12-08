import express from 'express';
import apiKeysService from '../services/apiKeys.js';
import { validateCreateApiKey, validateGetApiKeysQuery } from '../middleware/apiKeys.js';

const router = express.Router();

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     summary: Create a new API key
 *     description: Generate and create a new API key (requires JWT authentication)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name/description for the API key
 *                 example: "Production API Key"
 *               application_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional application ID to associate with the key
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional tenant ID to associate with the key
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date
 *     responses:
 *       201:
 *         description: API key created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateCreateApiKey, async (req, res, next) => {
  try {
    const { name, application_id, tenant_id, expires_at } = req.body;

    const apiKey = await apiKeysService.create({
      name,
      application_id: application_id || null,
      tenant_id: tenant_id || null,
      expires_at: expires_at || null
    });

    res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully. Store this key securely - it will not be shown again.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     summary: Get all API keys
 *     description: Retrieve all API keys with full key values, application names, and tenant names (requires JWT authentication)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of API keys to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of API keys to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, name, expires_at, last_used_at]
 *         description: Field to order by
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter API keys by tenant ID
 *     responses:
 *       200:
 *         description: List of API keys retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           key:
 *                             type: string
 *                           application_id:
 *                             type: string
 *                             format: uuid
 *                           application_name:
 *                             type: string
 *                           tenant_id:
 *                             type: string
 *                             format: uuid
 *                           tenant_name:
 *                             type: string
 *                           status:
 *                             type: string
 *                           expires_at:
 *                             type: string
 *                             format: date-time
 *                           last_used_at:
 *                             type: string
 *                             format: date-time
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateGetApiKeysQuery, async (req, res, next) => {
  try {
    // Use validated query data (already parsed and validated)
    const { limit, offset, orderBy, tenant_id } = req.validatedQuery || req.query;
    const options = {
      limit: limit || undefined,
      offset: offset || undefined,
      orderBy: orderBy || undefined,
      tenant_id: tenant_id || undefined
    };

    const apiKeys = await apiKeysService.getAllWithApplication(options);
    
    res.json({
      success: true,
      data: apiKeys,
      count: apiKeys.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
