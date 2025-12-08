import * as dotenv from "dotenv";
dotenv.config();

import express from 'express';
import http from "http";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "./config/swagger.js";

import ApiError from "./errors/errors.js";
import errorHandler from "./middleware/errorHandler.js";
import applicationsRouter from "./routes/applications.js";
import tenantsRouter from "./routes/tenants.js";
import usersRouter from "./routes/users.js";
import apiKeysRouter from "./routes/apiKeys.js";
import authenticationRouter from "./routes/authentication.js";
import rolesRouter from "./routes/roles.js";
import userRolesRouter from "./routes/userRoles.js";
import { validateApiKey } from './middleware/apiKey.js';
import { authenticate } from './middleware/authenticate.js';  

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no API key required)
app.get('/', (req, res) => {
  res.send({ 
    version: '1.0.0',
    message: `Server is running on port ${port}`,
    documentation: '/api/swagger'
  });
});

// Swagger UI (optional: protect this too if needed)
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sundrops API Documentation'
}));

// Apply API key validation to all subsequent routes
app.use(validateApiKey);

// Public authentication routes (no API key or JWT required)
app.use('/api/auth', authenticationRouter);

// Apply JWT authentication to all subsequent routes (except auth routes which are already registered above)
app.use(authenticate);

// Protected routes (require both API key and JWT authentication)
app.use('/api/applications', applicationsRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/users', usersRouter);
app.use('/api/api-keys', apiKeysRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/user-roles', userRolesRouter);

app.use((req, res, next) => next(ApiError.notFound("Route not found")));
  
app.use(errorHandler);

server.listen(port, () => console.log(`Server is running on port ${port}...`));