import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        cartKey: { type: String, required: true },
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 1 },
        portion: { type: String, default: '' },
        category: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
