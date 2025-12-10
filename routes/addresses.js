import express from 'express';
import addressesService from '../services/addresses.js';
import ApiError from '../errors/errors.js';
import { validateAddress, validateAddressUpdate, validateAddressId, validateUserIdForAddress } from '../middleware/addresses.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/users/{userId}/addresses:
 *   get:
 *     summary: Get all addresses for a user
 *     description: Retrieve all addresses for a specific user excluding soft deleted ones
 *     tags: [Addresses]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of addresses to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of addresses to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of addresses retrieved successfully
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
 *                     $ref: '#/components/schemas/Address'
 *                 count:
 *                   type: integer
 *                   description: Number of addresses returned
 *       400:
 *         description: Bad request - User ID is required
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
router.get('/', validateUserIdForAddress, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const addresses = await addressesService.getByUserId(userId, options);
    res.json({
      success: true,
      data: addresses,
      count: addresses.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/deleted:
 *   get:
 *     summary: Get all soft deleted addresses for a user
 *     description: Retrieve all addresses that have been soft deleted for a specific user
 *     tags: [Addresses]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of addresses to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of addresses to skip
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by
 *     responses:
 *       200:
 *         description: List of soft deleted addresses retrieved successfully
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
 *                     $ref: '#/components/schemas/Address'
 *                 count:
 *                   type: integer
 *                   description: Number of addresses returned
 *       400:
 *         description: Bad request - User ID is required
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
router.get('/deleted', validateUserIdForAddress, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit, offset, orderBy } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      orderBy: orderBy || undefined
    };

    const deletedAddresses = await addressesService.getDeletedByUserId(userId, options);
    res.json({
      success: true,
      data: deletedAddresses,
      count: deletedAddresses.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}:
 *   get:
 *     summary: Get address by ID for a user
 *     description: Retrieve a specific address by its ID for a specific user
 *     tags: [Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Bad request - User ID or Address ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
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
router.get('/:addressId', validateUserIdForAddress, validateAddressId, async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    const address = await addressesService.getByUserIdAndId(userId, addressId);
    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses:
 *   post:
 *     summary: Create a new address for a user
 *     description: Create a new address for a specific user
 *     tags: [Addresses]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 description: Street name
 *                 example: "Main Street"
 *               house:
 *                 type: string
 *                 description: House number
 *                 example: "123"
 *               box:
 *                 type: string
 *                 description: Box/Apartment number
 *                 example: "A"
 *               postalcode:
 *                 type: string
 *                 description: Postal code
 *                 example: "12345"
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: "New York"
*               country:
   *                 type: string
   *                 description: Country name
   *                 example: "United States"
   *               type:
   *                 type: string
   *                 description: Address type (e.g., billing, shipping, home)
   *                 example: "billing"
   *     responses:
   *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *                 message:
 *                   type: string
 *                   example: "Address created successfully"
 *       400:
 *         description: Bad request - Validation failed
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
router.post('/', validateUserIdForAddress, validateAddress, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const addressData = req.body;

    const newAddress = await addressesService.createForUser(userId, addressData);
    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}:
 *   patch:
 *     summary: Update an address by ID for a user
 *     description: Partially update an existing address for a specific user
 *     tags: [Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 description: Street name
 *                 example: "Main Street"
 *               house:
 *                 type: string
 *                 description: House number
 *                 example: "123"
 *               box:
 *                 type: string
 *                 description: Box/Apartment number
 *                 example: "A"
 *               postalcode:
 *                 type: string
 *                 description: Postal code
 *                 example: "12345"
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: "New York"
*               country:
   *                 type: string
   *                 description: Country name
   *                 example: "United States"
   *               type:
   *                 type: string
   *                 description: Address type (e.g., billing, shipping, home)
   *                 example: "shipping"
   *     responses:
   *       200:
   *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *                 message:
 *                   type: string
 *                   example: "Address updated successfully"
 *       400:
 *         description: Bad request - Validation failed or update data required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
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
router.patch('/:addressId', validateUserIdForAddress, validateAddressId, validateAddressUpdate, async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      throw ApiError.badRequest('Update data is required');
    }

    const updatedAddress = await addressesService.updateForUser(userId, addressId, updateData);
    res.json({
      success: true,
      data: updatedAddress,
      message: 'Address updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}:
 *   delete:
 *     summary: Soft delete an address by ID for a user
 *     description: Soft delete an address by setting its deleted_at timestamp
 *     tags: [Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *                 message:
 *                   type: string
 *                   example: "Address soft deleted successfully"
 *       400:
 *         description: Bad request - User ID or Address ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
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
router.delete('/:addressId', validateUserIdForAddress, validateAddressId, async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    const deletedAddress = await addressesService.softDeleteForUser(userId, addressId);
    res.json({
      success: true,
      data: deletedAddress,
      message: 'Address soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}/restore:
 *   post:
 *     summary: Restore a soft deleted address by ID for a user
 *     description: Restore a soft deleted address by clearing its deleted_at timestamp
 *     tags: [Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *                 message:
 *                   type: string
 *                   example: "Address restored successfully"
 *       400:
 *         description: Bad request - User ID or Address ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
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
router.post('/:addressId/restore', validateUserIdForAddress, validateAddressId, async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    const restoredAddress = await addressesService.restoreForUser(userId, addressId);
    res.json({
      success: true,
      data: restoredAddress,
      message: 'Address restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}/permanent:
 *   delete:
 *     summary: Permanently delete an address by ID for a user
 *     description: Permanently delete an address from the database (cannot be restored)
 *     tags: [Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Address permanently deleted successfully"
 *                 deletedData:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Bad request - User ID or Address ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Address not found
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
router.delete('/:addressId/permanent', validateUserIdForAddress, validateAddressId, async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    const result = await addressesService.permanentDeleteForUser(userId, addressId);
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
