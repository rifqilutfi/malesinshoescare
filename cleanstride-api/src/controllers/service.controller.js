const { z } = require('zod');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { success, created, error } = require('../utils/response');

// ── Validation Schema ──────────────────────────

const serviceSchema = z.object({
  name: z.string().max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  duration: z.string().max(50, 'Duration too long'),
  categoryId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

// ── Public Controllers ─────────────────────────

/**
 * GET /services — public, returns active services with category.
 */
async function index(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { price: 'asc' },
    });

    return success(res, services);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /services/categories — public, returns all categories.
 */
async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return success(res, categories);
  } catch (err) {
    next(err);
  }
}

// ── Admin Controllers ──────────────────────────

/**
 * GET /services/admin — admin, returns ALL services (including inactive).
 */
async function adminIndex(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, services);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /services — admin, create a new service.
 */
async function store(req, res, next) {
  try {
    // Parse body — price comes as string from FormData
    const body = {
      ...req.body,
      price: Number(req.body.price),
      categoryId: req.body.categoryId ? Number(req.body.categoryId) : null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    };

    const data = serviceSchema.parse(body);

    // Handle image if uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? true,
        imageUrl,
      },
      include: { category: true },
    });

    return created(res, service, 'Service created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /services/:id — admin, update a service.
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const serviceId = parseInt(id, 10);

    // Verify service exists
    const existing = await prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
    });

    // Parse body
    const body = {
      ...req.body,
      price: Number(req.body.price),
      categoryId: req.body.categoryId ? Number(req.body.categoryId) : null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    };

    const data = serviceSchema.parse(body);

    // Handle image
    let imageUrl = existing.imageUrl;
    if (req.file) {
      // Delete old image file if it exists
      if (existing.imageUrl) {
        const oldPath = require('path').join(__dirname, '..', '..', existing.imageUrl);
        fs.unlink(oldPath, () => {});
      }
      imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? existing.isActive,
        imageUrl,
      },
      include: { category: true },
    });

    return success(res, service, 'Service updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /services/:id/toggle — admin, toggle isActive status.
 */
async function toggleActive(req, res, next) {
  try {
    const { id } = req.params;
    const serviceId = parseInt(id, 10);

    const existing = await prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
    });

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: !existing.isActive },
      include: { category: true },
    });

    return success(res, service, `Service ${service.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /services/:id — admin, delete a service (only if no orders reference it).
 */
async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const serviceId = parseInt(id, 10);

    // Check if any orders reference this service
    const orderCount = await prisma.order.count({
      where: { serviceId },
    });

    if (orderCount > 0) {
      return error(
        res,
        `Cannot delete service: ${orderCount} order(s) reference this service. Deactivate it instead.`,
        409
      );
    }

    const existing = await prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
    });

    // Delete image file if exists
    if (existing.imageUrl) {
      const filePath = require('path').join(__dirname, '..', '..', existing.imageUrl);
      fs.unlink(filePath, () => {});
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return success(res, null, 'Service deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, adminIndex, getCategories, store, update, toggleActive, destroy };
