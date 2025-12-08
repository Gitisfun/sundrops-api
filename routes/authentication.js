import express from 'express';
import usersService from '../services/users.js';
import ApiError from '../errors/errors.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../schemas/authentication.js';
import { generateToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * Middleware to validate authentication request data
 */
const validateAuth = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    req.body = validatedData;
    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const formattedErrors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    next(ApiError.internal('Validation middleware error: ' + error.message));
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with password hashing. The password will be automatically hashed using bcrypt. The tenant_id is automatically extracted from the API key used for authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
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
 *                 enum: [active, inactive, suspended]
 *                 description: User's status
 *                 example: "active"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                       example: "User registered successfully"
 *       400:
 *         description: Bad request - Validation failed or user already exists
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
router.post('/register', validateAuth(registerSchema), async (req, res, next) => {
  try {
    // Get tenant_id from API key (set by validateApiKey middleware)
    if (!req.tenant_id) {
      throw ApiError.badRequest('API key must be associated with a tenant');
    }

    const userData = {
      ...req.body,
      tenant_id: req.tenant_id
    };

    // Use the usersService.create which already handles password hashing
    const newUser = await usersService.create(userData);
    
    // Remove password_hash from response for security
    const { password_hash, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user by email or username and password. The tenant_id is automatically extracted from the API key used for authentication. Returns user data with assigned roles (excludes password_hash, created_at, updated_at, deleted_at).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User's email or username
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: User ID
 *                     tenant_id:
 *                       type: string
 *                       format: uuid
 *                       description: Tenant ID
 *                     application_id:
 *                       type: string
 *                       format: uuid
 *                       description: Application ID
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     last_login_at:
 *                       type: string
 *                       format: date-time
 *                     user_roles:
 *                       type: array
 *                       description: List of roles assigned to this user
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: User role assignment ID
 *                           role_id:
 *                             type: string
 *                             format: uuid
 *                             description: Role ID
 *                           roles:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Admin"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid credentials
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
router.post('/login', validateAuth(loginSchema), async (req, res, next) => {
  try {

    // Get tenant_id from API key (set by validateApiKey middleware)
    if (!req.tenant_id) {
      throw ApiError.badRequest('API key must be associated with a tenant');
    }

    const { identifier, password } = req.body;
    const tenant_id = req.tenant_id;

    // Find user by email or username and tenant ID
    const user = await usersService.findByEmailOrUsernameAndTenant(identifier, tenant_id);

    if (!user) {
      throw ApiError.unauthorized('Invalid email/username, password, or tenant');
    }

    // Verify password
    const isPasswordValid = await usersService.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email/username, password, or tenant');
    }

    // Update last login timestamp
    await usersService.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive and unnecessary fields from response
    const { password_hash, created_at, updated_at, deleted_at, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse,
      token: token,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user from token
 *     description: Validate JWT token from Authorization header and return current user information with assigned roles
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid and user info returned
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
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *       401:
 *         description: Unauthorized - Invalid or expired token, or missing Authorization header
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
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization header with Bearer token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.message === 'Invalid or expired token') {
        throw ApiError.unauthorized('Invalid or expired token');
      }
      throw error;
    }

    // Fetch fresh user data from database
    const user = await usersService.getById(decoded.id);
    
    // Remove password_hash from response for security
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse,
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the password for a user. Requires current password verification. The tenant_id is automatically extracted from the API key used for authentication and used to verify the user belongs to that tenant.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - current_password
 *               - new_password
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user
 *                 example: "123e4567-e89b-12d3-a456-426614174002"
 *               current_password:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *                 example: "OldPassword123!"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 description: User's new password (will be hashed using bcrypt)
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                       example: "Password changed successfully"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not belong to the specified tenant
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
router.post('/change-password', validateAuth(changePasswordSchema), async (req, res, next) => {
  try {
    // Get tenant_id from API key (set by validateApiKey middleware)
    if (!req.tenant_id) {
      throw ApiError.badRequest('API key must be associated with a tenant');
    }

    const { user_id, current_password, new_password } = req.body;
    const tenant_id = req.tenant_id;

    // Get the user
    const user = await usersService.getById(user_id);

    // Verify that the user belongs to the tenant from the API key
    if (user.tenant_id !== tenant_id) {
      throw ApiError.forbidden('User does not belong to the tenant associated with the API key');
    }

    // Verify current password
    const isPasswordValid = await usersService.verifyPassword(current_password, user.password_hash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid current password');
    }

    // Update password (usersService.update handles password hashing)
    const updatedUser = await usersService.update(user_id, { password: new_password });

    // Remove password_hash from response for security
    const { password_hash, ...userResponse } = updatedUser;

    res.json({
      success: true,
      data: userResponse,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

