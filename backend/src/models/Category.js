import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    popularOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to normalize image if passed as a string
categorySchema.pre('validate', function (next) {
  if (typeof this.image === 'string') {
    this.image = { url: this.image, publicId: '' };
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
