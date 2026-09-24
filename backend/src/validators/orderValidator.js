import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItem: z.string().optional(),
      name: z.string().min(1, 'Item name required'),
      price: z.number().positive('Price must be positive'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      portion: z.string().optional(),
    })
  ).min(1, 'Order must contain at least 1 item'),
  customerName: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.object({
    street: z.string().min(5, 'Delivery street address is required'),
    city: z.string().default('Deoband'),
    state: z.string().default('Uttar Pradesh'),
    pincode: z.string().default('247554'),
  }),
  paymentMethod: z.enum(['COD', 'Pay at Restaurant']).default('COD'),
  notes: z.string().optional(),
});
