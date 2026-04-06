const { z } = require('zod');

const revenueQuerySchema = {
  query: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    groupBy: z.enum(['day', 'month', 'year']).optional()
  })
};

module.exports = {
  revenueQuerySchema
};
