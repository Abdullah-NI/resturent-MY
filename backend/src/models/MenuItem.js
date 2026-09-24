import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    priceOptions: [
      {
        portion: String, // e.g. "Half", "Full" or "Standard"
        price: Number,
      },
    ],
    image: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    preparationTime: {
      type: String,
      default: '15-20 mins',
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to normalize image if passed as a string
menuItemSchema.pre('validate', function (next) {
  if (typeof this.image === 'string') {
    this.image = { url: this.image, publicId: '' };
  }
  next();
});

menuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
