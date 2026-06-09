const prisma = require('../lib/prisma');
const { success } = require('../utils/response');

/**
 * GET /services — public, returns active services only.
 */
async function index(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return success(res, services);
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
