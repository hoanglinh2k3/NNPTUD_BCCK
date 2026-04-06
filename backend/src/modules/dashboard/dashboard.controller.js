const asyncHandler = require('../../common/helpers/async-handler');
const { sendSuccess } = require('../../common/response/api-response');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (_req, res) => {
  const summary = await dashboardService.getSummary();
  return sendSuccess(res, 'Dashboard summary fetched successfully', summary);
});

const getRevenue = asyncHandler(async (req, res) => {
  const revenue = await dashboardService.getRevenue(req.query);
  return sendSuccess(res, 'Revenue report fetched successfully', revenue);
});

const getTopProducts = asyncHandler(async (_req, res) => {
  const products = await dashboardService.getTopProducts();
  return sendSuccess(res, 'Top products fetched successfully', products);
});

const getLowStock = asyncHandler(async (_req, res) => {
  const items = await dashboardService.getLowStock();
  return sendSuccess(res, 'Low stock products fetched successfully', items);
});

module.exports = {
  getSummary,
  getRevenue,
  getTopProducts,
  getLowStock
};
