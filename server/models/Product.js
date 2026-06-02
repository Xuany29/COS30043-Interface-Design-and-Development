import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    shade_number: {
      type: String,
      trim: true,
    },
    shade_name: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    hex: {
      type: String,
      trim: true,
    },
    color_family: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    discount: {
      type: Number,
      default: null,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    skin: {
      type: [String],
      enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      default: [],
    },
    concerns_addressed: {
      type: [String],
      enum: ['acne', 'pigmentation', 'wrinkles', 'dullness', 'pores', 'hydration', 'redness'],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    volume: {
      type: String,
      trim: true,
    },
    shade: {
      type: String,
      trim: true,
    },
    finish: {
      type: String,
      trim: true,
    },
    suitable_skin_tones: {
      type: [String],
      enum: ['fair', 'medium', 'tan', 'deep'],
      default: [],
    },
    price_range_tag: {
      type: String,
      enum: ['low', 'mid', 'high', ''],
      default: '',
      trim: true,
    },
    has_variants: {
      type: Boolean,
      default: false,
    },
    variant_type: {
      type: String,
      enum: ['shade', 'size', 'scent', 'color', 'style', ''],
      default: '',
      trim: true,
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  },
);

export default mongoose.model('Product', productSchema, 'Product');
