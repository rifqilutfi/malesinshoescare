const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CleanStride API',
      version: '1.0.0',
      description: 'Shoe laundry management system API — MVP endpoints',
      contact: {
        name: 'CleanStride Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Login at POST /auth/login to get a token, then paste it here.',
        },
      },
      schemas: {
        // ── Request Schemas ──────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@cleanstride.com' },
            password: { type: 'string', example: 'password' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['customerName', 'phone', 'serviceId', 'shoeType', 'pickupDate', 'pickupTime'],
          properties: {
            customerName: { type: 'string', maxLength: 100, example: 'Andi Pratama' },
            phone: { type: 'string', maxLength: 20, example: '08123456789' },
            address: { type: 'string', nullable: true, example: 'Jl. Merdeka No. 10, Malang' },
            email: { type: 'string', format: 'email', nullable: true, example: 'andi@email.com' },
            serviceId: { type: 'integer', example: 2 },
            shoeType: { type: 'string', maxLength: 50, example: 'Sneakers' },
            quantity: { type: 'integer', minimum: 1, maximum: 10, default: 1, example: 1 },
            notes: { type: 'string', nullable: true, example: 'Ada noda kopi di bagian kanan' },
            pickupDate: { type: 'string', format: 'date', example: '2026-06-15' },
            pickupTime: { type: 'string', maxLength: 20, example: '09:00' },
            isUrgent: { type: 'boolean', default: false, example: false },
          },
        },
        UpdateStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'pickup', 'processing', 'qc', 'ready', 'delivery', 'completed', 'cancelled'],
              example: 'processing',
              description: 'Must be lowercase',
            },
          },
        },
        AIRecommendRequest: {
          type: 'object',
          required: ['material', 'condition'],
          properties: {
            material: { type: 'string', example: 'Canvas' },
            condition: { type: 'string', example: 'Heavy Dirt' },
          },
        },

        // ── Response Schemas ─────────────────────────
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Cleaning' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Quick Clean' },
            description: { type: 'string', example: 'Pembersihan cepat untuk sepatu yang tidak terlalu kotor.' },
            price: { type: 'string', description: 'Decimal string', example: '25000.00' },
            duration: { type: 'string', example: '1 Day' },
            isActive: { type: 'boolean', example: true },
            categoryId: { type: 'integer', nullable: true, example: 1 },
            imageUrl: { type: 'string', nullable: true, example: '/uploads/services/svc-123.jpg' },
            category: { $ref: '#/components/schemas/Category', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AIImageAnalysis: {
          type: 'object',
          properties: {
            recommendedService: { type: 'string', example: 'Deep Clean' },
            condition: { type: 'string', example: 'Heavy Dirt' },
            explanation: { type: 'string', example: 'The shoe shows significant dirt buildup...' },
            confidence: { type: 'number', example: 85 },
          },
        },
        AnalyticsDashboard: {
          type: 'object',
          properties: {
            kpiCards: {
              type: 'object',
              properties: {
                totalOrders: { type: 'integer' },
                completedOrders: { type: 'integer' },
                revenueEstimate: { type: 'number' },
                mostPopularService: { type: 'string' },
              },
            },
            ordersByStatus: { type: 'array', items: { type: 'object', properties: { status: { type: 'string' }, count: { type: 'integer' } } } },
            servicePopularity: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'integer' } } } },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Andi Pratama' },
            phone: { type: 'string', example: '08123456789' },
            address: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
          },
        },
        TimelineStep: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            step: { type: 'string', example: 'Order Received' },
            description: { type: 'string', example: 'Pesanan diterima dan dikonfirmasi' },
            completed: { type: 'boolean' },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            orderNumber: { type: 'string', example: 'CLS-A1B2C3D4E' },
            status: { type: 'string', enum: ['PENDING', 'PICKUP', 'PROCESSING', 'QC', 'READY', 'DELIVERY', 'COMPLETED', 'CANCELLED'] },
            progress: { type: 'integer', minimum: 0, maximum: 100 },
            shoeType: { type: 'string' },
            quantity: { type: 'integer' },
            notes: { type: 'string', nullable: true },
            isUrgent: { type: 'boolean' },
            subtotal: { type: 'string', description: 'Decimal string' },
            urgentFee: { type: 'string', description: 'Decimal string' },
            total: { type: 'string', description: 'Decimal string' },
            estimatedCompletion: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            customer: { $ref: '#/components/schemas/Customer' },
            service: { $ref: '#/components/schemas/Service' },
            timeline: { type: 'array', items: { $ref: '#/components/schemas/TimelineStep' } },
          },
        },
        TrackingResponse: {
          type: 'object',
          properties: {
            orderNumber: { type: 'string' },
            status: { type: 'string' },
            progress: { type: 'integer' },
            shoeType: { type: 'string' },
            service: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
              },
            },
            isUrgent: { type: 'boolean' },
            estimatedCompletion: { type: 'string', format: 'date', nullable: true },
            total: { type: 'string' },
            timeline: { type: 'array', items: { $ref: '#/components/schemas/TimelineStep' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AIRecommendation: {
          type: 'object',
          properties: {
            recommendedService: { type: 'string', example: 'Deep Clean' },
            estimatedDuration: { type: 'string', example: '3-5 Days' },
            estimatedPrice: { type: 'number', example: 75000 },
            reason: { type: 'string', example: 'Recommended based on Canvas material with Heavy Dirt condition.' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' }, nullable: true },
          },
        },
      },
    },

    // ── Path Definitions ───────────────────────────
    paths: {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Admin login',
          description: 'Authenticate with email and password to receive a JWT token.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'integer' },
                                  name: { type: 'string' },
                                  email: { type: 'string' },
                                },
                              },
                              token: { type: 'string', description: 'JWT token' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/services': {
        get: {
          tags: ['Services'],
          summary: 'List active services',
          description: 'Returns all active shoe cleaning services, ordered by price ascending.',
          responses: {
            200: {
              description: 'List of services',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { type: 'array', items: { $ref: '#/components/schemas/Service' } },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/orders': {
        post: {
          tags: ['Orders (Public)'],
          summary: 'Create a new order (booking)',
          description: 'Public endpoint for customers to create orders. Automatically finds or creates a customer by phone number.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Order created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/Order' } } },
                    ],
                  },
                },
              },
            },
            422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        get: {
          tags: ['Orders (Admin)'],
          summary: 'List all orders (paginated)',
          description: 'Admin-only. Returns orders with customer, service, and timeline relations.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status (lowercase)' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by order number or customer name' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 15 } },
          ],
          responses: {
            200: {
              description: 'Paginated order list',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                              pagination: {
                                type: 'object',
                                properties: {
                                  page: { type: 'integer' },
                                  limit: { type: 'integer' },
                                  total: { type: 'integer' },
                                  totalPages: { type: 'integer' },
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/{id}/status': {
        patch: {
          tags: ['Orders (Admin)'],
          summary: 'Update order status',
          description: 'Admin-only. Updates order status and auto-advances the timeline. Status values must be lowercase.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Order ID' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateStatusRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Status updated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/Order' } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            404: { description: 'Order not found' },
            422: { description: 'Invalid status value' },
          },
        },
      },
      '/track/{orderCode}': {
        get: {
          tags: ['Tracking'],
          summary: 'Track order by code',
          description: 'Public endpoint. Returns order status, progress, timeline, and estimated completion.',
          parameters: [
            { name: 'orderCode', in: 'path', required: true, schema: { type: 'string' }, description: 'Order number (e.g. CLS-A1B2C3D4E)', example: 'CLS-A1B2C3D4E' },
          ],
          responses: {
            200: {
              description: 'Tracking data',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/TrackingResponse' } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/ai/recommend': {
        post: {
          tags: ['AI'],
          summary: 'Get AI service recommendation (text-based)',
          description: 'Public endpoint. Uses AI (via OpenRouter) to recommend a service based on shoe material and condition.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AIRecommendRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Recommendation generated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/AIRecommendation' } } },
                    ],
                  },
                },
              },
            },
            422: { description: 'Validation error' },
          },
        },
      },
      '/ai/analyze': {
        post: {
          tags: ['AI'],
          summary: 'Analyze shoe image with AI',
          description: 'Public endpoint. Upload a shoe image for AI vision analysis (via OpenRouter). Returns condition, recommended service, explanation, and confidence score.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Shoe image (JPEG, PNG, WebP, max 5MB)' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Image analyzed',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/AIImageAnalysis' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'No image uploaded' },
          },
        },
      },
      '/services/admin': {
        get: {
          tags: ['Services (Admin)'],
          summary: 'List all services (admin)',
          description: 'Admin-only. Returns all services including inactive ones.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of all services',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Service' } } } }] } } },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/services/categories': {
        get: {
          tags: ['Services'],
          summary: 'List all categories',
          description: 'Public endpoint. Returns all service categories.',
          responses: {
            200: {
              description: 'List of categories',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } }] } } },
            },
          },
        },
      },
      '/services/{id}': {
        put: {
          tags: ['Services (Admin)'],
          summary: 'Update a service',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' },
                    duration: { type: 'string' }, categoryId: { type: 'integer' }, isActive: { type: 'boolean' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Service updated' }, 401: { description: 'Unauthorized' } },
        },
        delete: {
          tags: ['Services (Admin)'],
          summary: 'Delete a service',
          description: 'Deletes a service only if no orders reference it.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Service deleted' }, 401: { description: 'Unauthorized' }, 409: { description: 'Service has orders' } },
        },
      },
      '/services/{id}/toggle': {
        patch: {
          tags: ['Services (Admin)'],
          summary: 'Toggle service active status',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Status toggled' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/analytics/dashboard': {
        get: {
          tags: ['Analytics'],
          summary: 'Get dashboard analytics',
          description: 'Admin-only. Returns KPI cards, orders-by-status chart data, and service popularity chart data.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Analytics data',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/AnalyticsDashboard' } } }] } } },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [], // We define paths inline above, no JSDoc scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
