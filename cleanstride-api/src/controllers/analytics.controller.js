const prisma = require('../lib/prisma');
const { success } = require('../utils/response');

/**
 * GET /analytics/dashboard — admin, returns KPI cards + chart data.
 */
async function dashboard(req, res, next) {
  try {
    // KPI: Total orders
    const totalOrders = await prisma.order.count();

    // KPI: Completed orders
    const completedOrders = await prisma.order.count({
      where: { status: 'COMPLETED' },
    });

    // KPI: Revenue estimate (sum of total for completed orders)
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true },
    });
    const revenueEstimate = Number(revenueResult._sum.total) || 0;

    // KPI: Most popular service
    const popularServiceResult = await prisma.order.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let mostPopularService = 'N/A';
    if (popularServiceResult.length > 0) {
      const svc = await prisma.service.findUnique({
        where: { id: popularServiceResult[0].serviceId },
        select: { name: true },
      });
      mostPopularService = svc?.name || 'N/A';
    }

    // Chart: Orders by status
    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const ordersByStatus = ordersByStatusRaw.map((row) => ({
      status: row.status,
      count: row._count.id,
    }));

    // Chart: Service popularity
    const servicePopularityRaw = await prisma.order.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const serviceIds = servicePopularityRaw.map((r) => r.serviceId);
    const servicesMap = {};
    if (serviceIds.length > 0) {
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, name: true },
      });
      services.forEach((s) => {
        servicesMap[s.id] = s.name;
      });
    }

    const servicePopularity = servicePopularityRaw.map((row) => ({
      name: servicesMap[row.serviceId] || `Service #${row.serviceId}`,
      count: row._count.id,
    }));

    return success(res, {
      kpiCards: {
        totalOrders,
        completedOrders,
        revenueEstimate,
        mostPopularService,
      },
      ordersByStatus,
      servicePopularity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
