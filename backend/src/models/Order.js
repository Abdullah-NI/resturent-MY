import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for guest checkouts
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        portion: { type: String, default: '' },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, default: 'Deoband' },
      state: { type: String, default: 'Uttar Pradesh' },
      pincode: { type: String, default: '247554' },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Pay at Restaurant'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Completed', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
