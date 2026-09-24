import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Image title is required'],
    },
    category: {
      type: String,
      enum: ['Food', 'Ambience', 'Restaurant', 'Events'],
      default: 'Food',
    },
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
    imageUrl: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Pre-validate hook to handle string image inputs and keep imageUrl in sync
gallerySchema.pre('validate', function (next) {
  if (typeof this.image === 'string') {
    this.image = { url: this.image, publicId: '' };
  }
  if (this.image && this.image.url) {
    this.imageUrl = this.image.url;
  } else if (this.imageUrl && (!this.image || !this.image.url)) {
    this.image = { url: this.imageUrl, publicId: '' };
  }
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
