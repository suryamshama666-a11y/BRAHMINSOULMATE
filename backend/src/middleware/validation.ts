import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const planSchema = Joi.object({
  planId: Joi.string().valid('basic', 'premium', 'elite').required(),
});

const verifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  planId: Joi.string().valid('basic', 'premium', 'elite').required(),
});

export const validatePayment = {
  createOrder: (req: Request, res: Response, next: NextFunction) => {
    const { error } = planSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.message });
    next();
  },
  verifyPayment: (req: Request, res: Response, next: NextFunction) => {
    const { error } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.message });
    next();
  },
};

