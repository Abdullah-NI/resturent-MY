import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import mongoose from 'mongoose';
import { getCache, setCache } from './redisService.js';

/**
 * MCP Tools Schema Definition for LLM Tool Calling
 */
export const mcpToolsDefinitions = [
  {
    type: 'function',
    function: {
      name: 'searchMenu',
      description:
        'Search Sky Lounge menu items by keyword, category, price range, or dietary preference (vegetarian/non-vegetarian). Use this when user asks for dish recommendations, prices, or menu availability.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword for dish name or ingredients (e.g. paneer, tikka, shake, soup)' },
          category: { type: 'string', description: 'Category name or slug (e.g. Chinese, Main Course, Starter / Snacks, Pizza, Shakes)' },
          minPrice: { type: 'number', description: 'Minimum price filter in INR (₹)' },
          maxPrice: { type: 'number', description: 'Maximum price filter in INR (₹)' },
          isVegetarian: { type: 'boolean', description: 'Set true to filter only vegetarian items' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMenuItem',
      description: 'Get detailed information for a specific menu item dish by name or ID.',
      parameters: {
        type: 'object',
        properties: {
          dishNameOrId: { type: 'string', description: 'Dish name or MongoDB ObjectId' },
        },
        required: ['dishNameOrId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRestaurantInfo',
      description: 'Get general Sky Lounge restaurant information including opening hours, address, contact phone, dietary policies, and delivery rules.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMyOrders',
      description: 'Retrieve order history for the currently logged-in user. Requires user to be logged in.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOrderStatus',
      description: 'Check the real-time status of an order using its order number (e.g. ORD-123456) or order ID.',
      parameters: {
        type: 'object',
        properties: {
          orderIdentifier: { type: 'string', description: 'Order Number (e.g. ORD-123456) or Order Mongo ID' },
        },
        required: ['orderIdentifier'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMyReservations',
      description: 'Retrieve table reservations for the currently logged-in user. Requires user to be logged in.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkReservationAvailability',
      description: 'Check if table seating is available for a given date, time, and guest count.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD or DD/MM/YYYY format' },
          time: { type: 'string', description: 'Time of reservation (e.g. 7:30 PM, 20:00)' },
          numberOfGuests: { type: 'number', description: 'Number of guests (1-30)' },
        },
        required: ['date', 'time', 'numberOfGuests'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createReservation',
      description: 'Create a new table reservation at Sky Lounge. Requires user to be logged in and explicitly confirm details.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Customer guest name' },
          phone: { type: 'string', description: 'Customer contact phone number' },
          email: { type: 'string', description: 'Customer email address' },
          date: { type: 'string', description: 'Reservation date (e.g. 2026-09-25)' },
          time: { type: 'string', description: 'Reservation time (e.g. 8:00 PM)' },
          numberOfGuests: { type: 'number', description: 'Number of guests' },
          specialRequest: { type: 'string', description: 'Special request notes (e.g. birthday decor, quiet rooftop table)' },
        },
        required: ['name', 'phone', 'date', 'time', 'numberOfGuests'],
      },
    },
  },
];

/**
 * Execute MCP Tool securely on backend
 */
export const executeMcpTool = async (toolName, toolArgs, contextUser = null) => {
  try {
    switch (toolName) {
      case 'searchMenu': {
        const { query, category, minPrice, maxPrice, isVegetarian } = toolArgs;
        const filter = { isAvailable: true };

        if (query) {
          filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } },
          ];
        }

        if (category) {
          if (mongoose.Types.ObjectId.isValid(category)) {
            filter.category = category;
          } else {
            const catDoc = await Category.findOne({
              $or: [{ name: { $regex: category, $options: 'i' } }, { slug: category.toLowerCase() }],
            });
            if (catDoc) filter.category = catDoc._id;
          }
        }

        if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) filter.price.$gte = Number(minPrice);
          if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (isVegetarian !== undefined) {
          filter.isVegetarian = isVegetarian;
        }

        const cacheKey = `mcp:menu:${JSON.stringify(filter)}`;
        const cachedMenu = await getCache(cacheKey);
        if (cachedMenu) return cachedMenu;

        const items = await MenuItem.find(filter)
          .populate('category', 'name slug')
          .select('name description price priceOptions isVegetarian preparationTime isPopular tags')
          .limit(20);

        const result = {
          success: true,
          count: items.length,
          dishes: items.map((i) => ({
            id: i._id,
            name: i.name,
            price: i.price,
            category: i.category ? i.category.name : 'General',
            isVegetarian: i.isVegetarian !== false,
            description: i.description,
            preparationTime: i.preparationTime,
            priceOptions: i.priceOptions || [],
          })),
        };

        await setCache(cacheKey, result, 120);
        return result;
      }

      case 'getMenuItem': {
        const { dishNameOrId } = toolArgs;
        let item = null;

        if (mongoose.Types.ObjectId.isValid(dishNameOrId)) {
          item = await MenuItem.findById(dishNameOrId).populate('category', 'name slug');
        } else {
          item = await MenuItem.findOne({ name: { $regex: dishNameOrId, $options: 'i' } }).populate('category', 'name slug');
        }

        if (!item) {
          return { success: false, message: `Dish matching "${dishNameOrId}" was not found in Sky Lounge menu.` };
        }

        return {
          success: true,
          dish: {
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category ? item.category.name : 'General',
            description: item.description,
            isAvailable: item.isAvailable,
            isVegetarian: item.isVegetarian !== false,
            preparationTime: item.preparationTime,
            tags: item.tags || [],
            priceOptions: item.priceOptions || [],
          },
        };
      }

      case 'getRestaurantInfo': {
        return {
          success: true,
          info: {
            name: 'Sky Lounge Restaurant',
            location: 'Deoband, Uttar Pradesh (Pincode: 247554)',
            phone: '9760999444',
            openingHours: '11:00 AM - 11:00 PM (Daily)',
            dietary: '100% Pure Vegetarian Fine Dining',
            deliveryFee: 'Flat ₹40 for local Deoband orders',
            acceptedPaymentMethods: ['Cash on Delivery (COD)', 'Pay at Restaurant'],
          },
        };
      }

      case 'getMyOrders': {
        if (!contextUser) {
          return {
            success: false,
            requiresAuth: true,
            message: 'You are not logged in. Please log in to view your personal order history.',
          };
        }

        const orders = await Order.find({ user: contextUser._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderNumber items total orderStatus paymentStatus paymentMethod createdAt notes');

        return {
          success: true,
          count: orders.length,
          orders: orders.map((o) => ({
            orderId: o._id,
            orderNumber: o.orderNumber,
            total: o.total,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
            items: o.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
            date: o.createdAt,
          })),
        };
      }

      case 'getOrderStatus': {
        const { orderIdentifier } = toolArgs;
        let order = null;

        if (mongoose.Types.ObjectId.isValid(orderIdentifier)) {
          order = await Order.findById(orderIdentifier);
        } else {
          order = await Order.findOne({ orderNumber: orderIdentifier.trim().toUpperCase() });
        }

        if (!order) {
          return { success: false, message: `No order found with ID or Order Number "${orderIdentifier}".` };
        }

        // Security authorization check: If order is associated with a user, enforce ownership check
        if (order.user) {
          if (!contextUser) {
            return {
              success: false,
              requiresAuth: true,
              message: 'This order belongs to a registered account. Please log in to view details.',
            };
          }
          if (order.user.toString() !== contextUser._id.toString() && contextUser.role !== 'admin') {
            return {
              success: false,
              message: 'Unauthorized access. You can only view status for your own orders.',
            };
          }
        }

        return {
          success: true,
          order: {
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            itemsCount: order.items.length,
            createdAt: order.createdAt,
          },
        };
      }

      case 'getMyReservations': {
        if (!contextUser) {
          return {
            success: false,
            requiresAuth: true,
            message: 'You are not logged in. Please log in to view your table reservations.',
          };
        }

        const reservations = await Reservation.find({ user: contextUser._id })
          .sort({ createdAt: -1 })
          .limit(10);

        return {
          success: true,
          count: reservations.length,
          reservations: reservations.map((r) => ({
            id: r._id,
            name: r.name,
            date: r.date,
            time: r.time,
            numberOfGuests: r.numberOfGuests,
            status: r.status,
            specialRequest: r.specialRequest,
          })),
        };
      }

      case 'checkReservationAvailability': {
        const { date, time, numberOfGuests } = toolArgs;

        // Count existing confirmed/pending reservations for target date/time
        const existingCount = await Reservation.countDocuments({
          date,
          time,
          status: { $in: ['Pending', 'Confirmed'] },
        });

        // Sky Lounge threshold per time slot (e.g. max 15 tables per time slot)
        const isAvailable = existingCount < 15;

        return {
          success: true,
          date,
          time,
          requestedGuests: numberOfGuests,
          isAvailable,
          message: isAvailable
            ? `Table space is available on ${date} at ${time} for ${numberOfGuests} guest(s).`
            : `Sorry, ${time} on ${date} is currently fully booked. Please try an alternate time slot.`,
        };
      }

      case 'createReservation': {
        if (!contextUser) {
          return {
            success: false,
            requiresAuth: true,
            message: 'You must be logged in to complete a table reservation.',
          };
        }

        const { name, phone, email, date, time, numberOfGuests, specialRequest } = toolArgs;

        const newReservation = await Reservation.create({
          name: name || contextUser.name,
          phone: phone || contextUser.phone,
          email: email || contextUser.email || '',
          date,
          time,
          numberOfGuests: Number(numberOfGuests),
          specialRequest: specialRequest || '',
          user: contextUser._id,
          status: 'Pending',
        });

        return {
          success: true,
          message: 'Table reservation request successfully created!',
          reservation: {
            id: newReservation._id,
            name: newReservation.name,
            date: newReservation.date,
            time: newReservation.time,
            numberOfGuests: newReservation.numberOfGuests,
            status: newReservation.status,
          },
        };
      }

      default:
        return { success: false, message: `Unknown MCP tool function "${toolName}".` };
    }
  } catch (err) {
    console.error(`MCP Tool error (${toolName}):`, err);
    return { success: false, error: err.message };
  }
};

export default {
  mcpToolsDefinitions,
  executeMcpTool,
};
