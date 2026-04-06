const dashboardRepository = require('./dashboard.repository');

async function getSummary() {
  return dashboardRepository.getSummary();
}

async function getRevenue(query) {
  return dashboardRepository.getRevenue(query);
}

async function getTopProducts() {
  return dashboardRepository.getTopProducts();
}

async function getLowStock() {
  return dashboardRepository.getLowStock();
}

module.exports = {
  getSummary,
  getRevenue,
  getTopProducts,
  getLowStock
};
