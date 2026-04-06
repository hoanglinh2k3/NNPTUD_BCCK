const { z } = require('zod');
const { ORDER_STATUS_VALUES } = require('../../common/constants/order-status.constant');

const orderIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const checkoutSchema = {
  body: z.object({
    addressId: z.coerce.number().int().positive(),
    paymentMethod: z.string().min(2).max(30),
    note: z.string().max(255).optional().nullable()
  })
};

const listOrdersSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    status: z.enum(ORDER_STATUS_VALUES).optional(),
    paymentStatus: z.string().optional(),
    keyword: z.string().optional()
  })
};

const updateOrderStatusSchema = {
  params: orderIdSchema.params,
  body: z.object({
    status: z.enum(ORDER_STATUS_VALUES)
  })
};

module.exports = {
  orderIdSchema,
  checkoutSchema,
  listOrdersSchema,
  updateOrderStatusSchema
};
