import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sundrops API',
      version: '1.0.0',
      description: 'API documentation for Sundrops application management system',
      contact: {
        name: 'API Support',
        email: 'support@sundrops.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Application: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the application',
              example: '4c817926-7050-4cc3-ba54-a044bf21d3f8'
            },
            name: {
              type: 'string',
              description: 'Name of the application',
              example: 'Finance App'
            },
            key: {
              type: 'string',
              description: 'URL-friendly identifier for the application',
              example: 'finance-app'
            },
            is_multitenant: {
              type: 'boolean',
              description: 'Whether the application supports multiple tenants',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-10-16T18:51:21.091564+00:00'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-10-16T18:51:21.091564+00:00'
            },
            deleted_at: {
              type: 'string',
              format: 'date-time',
              description: 'Soft deletion timestamp',
              nullable: true,
              example: null
            }
          },
          required: ['id', 'name', 'key', 'is_multitenant', 'created_at', 'updated_at']
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            count: {
              type: 'integer',
              description: 'Number of items returned (for list endpoints)'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerOptions, swaggerSpec };
