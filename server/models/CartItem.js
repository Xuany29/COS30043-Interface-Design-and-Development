import mongoose from 'mongoose';

const selectedVariantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    hex: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const cartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    selectedVariant: {
      type: selectedVariantSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

cartItemSchema.index({ user: 1, product: 1, 'selectedVariant.id': 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema, 'Cart');
