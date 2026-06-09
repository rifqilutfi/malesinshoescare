const prisma = require('../lib/prisma');
const { generateOrderNumber } = require('../utils/orderNumber');

/**
 * Default timeline steps for every new order.
 * Ported from Laravel OrderTimeline::defaultSteps().
 */
const DEFAULT_STEPS = [
  { step: 'Order Received', description: 'Pesanan diterima dan dikonfirmasi' },
  { step: 'Pickup', description: 'Sepatu berhasil dijemput dari alamat customer' },
  { step: 'Processing', description: 'Sepatu sedang dalam proses pencucian' },
  { step: 'Quality Control', description: 'Pengecekan kualitas hasil pencucian' },
  { step: 'Ready for Delivery', description: 'Siap untuk diantar ke customer' },
  { step: 'Delivered', description: 'Sepatu telah sampai ke customer' },
];

/**
 * Map order status to progress percentage.
 * Ported from Laravel Order::getProgressFromStatus().
 */
const STATUS_PROGRESS = {
  pending: 0,
  pickup: 15,
  processing: 40,
  qc: 70,
  ready: 85,
  delivery: 95,
  completed: 100,
  cancelled: 0,
};

/**
 * Map status to the timeline step that should be marked completed.
 * Ported from Laravel OrderController::updateStatus().
 */
const STATUS_TO_STEP = {
  pickup: 'Pickup',
  processing: 'Processing',
  qc: 'Quality Control',
  ready: 'Ready for Delivery',
  delivery: 'Ready for Delivery',
  completed: 'Delivered',
};

/**
 * Find or create customer by phone.
 * Locked logic: phone is the unique key for customer reuse.
 */
async function findOrCreateCustomer({ name, phone, address, email }) {
  let customer = await prisma.customer.findUnique({ where: { phone } });

  if (customer) {
    // Update name and address if provided (same as Laravel)
    const updates = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (email && !customer.email) updates.email = email;

    if (Object.keys(updates).length > 0) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: updates,
      });
    }
  } else {
    customer = await prisma.customer.create({
      data: { name, phone, address: address || null, email: email || null },
    });
  }

  return customer;
}

/**
 * Calculate order totals.
 * Ported from Laravel Order::calculateTotals().
 */
function calculateTotals(servicePrice, quantity, isUrgent) {
  const subtotal = Number(servicePrice) * quantity;
  const urgentFee = isUrgent ? subtotal * 0.3 : 0;
  const total = subtotal + urgentFee;
  return { subtotal, urgentFee, total };
}

/**
 * Create a new order with timeline.
 */
async function createOrder(data) {
  const { customerName, phone, address, email, serviceId, shoeType, quantity, notes, pickupDate, pickupTime, isUrgent } = data;

  // 1. Find or create customer
  const customer = await findOrCreateCustomer({
    name: customerName,
    phone,
    address,
    email,
  });

  // 2. Get service for price
  const service = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });

  // 3. Calculate totals
  const { subtotal, urgentFee, total } = calculateTotals(service.price, quantity, isUrgent);

  // 4. Estimated completion (hardcoded: urgent=1 day, normal=3 days)
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + (isUrgent ? 1 : 3));

  // 5. Create order + timeline in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        serviceId: service.id,
        shoeType,
        quantity,
        notes: notes || null,
        pickupDate: new Date(pickupDate),
        pickupTime,
        isUrgent,
        status: 'PENDING',
        progress: 0,
        estimatedCompletion,
        subtotal,
        urgentFee,
        total,
      },
    });

    // Create all timeline steps
    await tx.orderTimeline.createMany({
      data: DEFAULT_STEPS.map((step) => ({
        orderId: newOrder.id,
        ...step,
      })),
    });

    // Mark first step as completed
    const firstStep = await tx.orderTimeline.findFirst({
      where: { orderId: newOrder.id, step: 'Order Received' },
    });
    if (firstStep) {
      await tx.orderTimeline.update({
        where: { id: firstStep.id },
        data: { completed: true, completedAt: new Date() },
      });
    }

    return newOrder;
  });

  // 6. Return order with relations
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      customer: true,
      service: true,
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  });
}

/**
 * Update order status and sync timeline.
 * Ported from Laravel OrderController::updateStatus().
 */
async function updateOrderStatus(orderId, newStatus) {
  const progress = STATUS_PROGRESS[newStatus] ?? 0;

  const order = await prisma.$transaction(async (tx) => {
    // Update order status + progress
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus.toUpperCase(),
        progress,
      },
    });

    // Mark corresponding timeline step as completed
    const stepName = STATUS_TO_STEP[newStatus];
    if (stepName) {
      const step = await tx.orderTimeline.findFirst({
        where: { orderId, step: stepName, completed: false },
      });
      if (step) {
        await tx.orderTimeline.update({
          where: { id: step.id },
          data: { completed: true, completedAt: new Date() },
        });
      }
    }

    return updated;
  });

  // Return with relations
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      customer: true,
      service: true,
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  });
}

module.exports = {
  createOrder,
  updateOrderStatus,
  STATUS_PROGRESS,
};
