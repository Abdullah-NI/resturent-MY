import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Dish name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  preparationTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});
