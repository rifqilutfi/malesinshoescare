const prisma = require('../lib/prisma');
const { success } = require('../utils/response');

/**
 * GET /track/:orderCode — public, track order by order number.
 */
async function track(req, res, next) {
  try {
    const { orderCode } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderCode },
      include: {
        service: true,
        timeline: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order code.',
      });
    }

    // Return only tracking-relevant data (no customer details for privacy)
    return success(res, {
      orderNumber: order.orderNumber,
      status: order.status,
      progress: order.progress,
      shoeType: order.shoeType,
      service: {
        name: order.service.name,
        description: order.service.description,
      },
      isUrgent: order.isUrgent,
      estimatedCompletion: order.estimatedCompletion,
      total: order.total,
      timeline: order.timeline,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { track };
