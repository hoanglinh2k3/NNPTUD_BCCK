const { z } = require('zod');
const { PAYMENT_STATUS_VALUES } = require('../../common/constants/payment-status.constant');

const paymentIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const orderIdSchema = {
  params: z.object({
    orderId: z.coerce.number().int().positive()
  })
};

const createPaymentSchema = {
  body: z.object({
    orderId: z.coerce.number().int().positive(),
    method: z.string().min(2).max(30),
    amount: z.coerce.number().positive(),
    status: z.enum(PAYMENT_STATUS_VALUES)
  })
};

const updatePaymentStatusSchema = {
  params: paymentIdSchema.params,
  body: z.object({
    status: z.enum(PAYMENT_STATUS_VALUES),
    transactionCode: z.string().max(100).optional().nullable()
  })
};

module.exports = {
  paymentIdSchema,
  orderIdSchema,
  createPaymentSchema,
  updatePaymentStatusSchema
};
