const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success, created } = require('../utils/response');
const { createOrder, updateOrderStatus } = require('../services/order.service');

// ── Validation Schemas ─────────────────────────

const createOrderSchema = z.object({
  customerName: z.string().max(100, 'Name too long'),
  phone: z.string().max(20, 'Phone too long'),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  serviceId: z.number().int().positive(),
  shoeType: z.string().max(50),
  quantity: z.number().int().min(1).max(10).default(1),
  notes: z.string().optional(),
  pickupDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  pickupTime: z.string().max(20),
  isUrgent: z.boolean().default(false),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'pending', 'pickup', 'processing', 'qc',
    'ready', 'delivery', 'completed', 'cancelled',
  ]),
});

// ── Controllers ────────────────────────────────

/**
 * POST /orders — public, create a new order.
 */
async function store(req, res, next) {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await createOrder(data);
    return created(res, order, 'Order created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders — admin, list all orders with filters.
 */
async function index(req, res, next) {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          service: true,
          timeline: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return success(res, {
      orders,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /orders/:id/status — admin, update order status.
 */
async function patchStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    // Verify order exists
    await prisma.order.findUniqueOrThrow({
      where: { id: parseInt(id, 10) },
    });

    const order = await updateOrderStatus(parseInt(id, 10), status);
    return success(res, order, 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { store, index, patchStatus };
