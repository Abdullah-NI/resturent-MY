import { z } from 'zod';

export const reservationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  numberOfGuests: z.number().int().min(1, 'At least 1 guest required').max(30, 'For groups over 30, please call us directly'),
  specialRequest: z.string().optional(),
});
