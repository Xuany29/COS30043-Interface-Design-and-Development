import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAdmin, requireAuth } from './auth.js';

const router = Router();

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeVariants(value) {
  if (!value) {
    return [];
  }

  let variants = value;

  if (typeof value === 'string') {
    try {
      variants = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .map(variant => ({
      shade_number: variant.shade_number?.trim?.() || variant.shadeNumber?.trim?.() || '',
      shade_name: variant.shade_name?.trim?.() || variant.shadeName?.trim?.() || variant.name?.trim?.() || '',
      name: variant.name?.trim?.() || variant.shade_name?.trim?.() || variant.shadeName?.trim?.() || '',
      description: variant.description?.trim?.() || '',
      hex: variant.hex?.trim?.() || '',
      color_family: variant.color_family?.trim?.() || variant.colorFamily?.trim?.() || '',
      stock: variant.stock === '' || variant.stock == null ? undefined : Number(variant.stock),
    }))
    .filter(variant => variant.shade_name || variant.name || variant.shade_number);
}

function productPayload(body) {
  const variants = normalizeVariants(body.variants);

  const payload = {
    brand: body.brand?.trim(),
    name: body.name?.trim(),
    price: Number(body.price),
    originalPrice: body.originalPrice === '' || body.originalPrice == null ? null : Number(body.originalPrice),
    discount: body.discount === '' || body.discount == null ? null : Number(body.discount),
    image: body.image?.trim() || '',
      imageUrl: body.imageUrl?.trim() || body.image?.trim() || '',
      images: normalizeStringList(body.images),
      category: body.category?.trim(),
    subCategory: body.subCategory?.trim() || body.subcategory?.trim() || '',
    skin: normalizeStringList(body.skin),
    concerns_addressed: normalizeStringList(body.concerns_addressed),
    stock: body.stock === '' || body.stock == null ? 0 : Number(body.stock),
    description: body.description?.trim() || '',
    ingredients: normalizeStringList(body.ingredients),
    volume: body.volume?.trim() || '',
    shade: body.shade?.trim() || '',
    finish: body.finish?.trim() || '',
    suitable_skin_tones: normalizeStringList(body.suitable_skin_tones),
    price_range_tag: body.price_range_tag?.trim() || '',
    has_variants: Boolean(body.has_variants || variants.length),
    variant_type: body.variant_type?.trim() || (variants.length ? 'shade' : ''),
    variants,
    isNew: Boolean(body.isNew),
    isBestseller: Boolean(body.isBestseller),
    isFeatured: Boolean(body.isFeatured),
  };

  return payload;
}

function validateProductPayload(payload) {
  if (!payload.brand || !payload.name || !payload.category || !payload.subCategory) {
    return 'Brand, name, category, and subcategory are required.';
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'Price must be a valid number.';
  }

  if (!Number.isFinite(payload.stock) || payload.stock < 0) {
    return 'Stock must be a valid number.';
  }

  if (!payload.image && !payload.imageUrl && !payload.images.length) {
    return 'Product image is required.';
  }

  if (!payload.description) {
    return 'Description is required.';
  }

  if (!payload.price_range_tag) {
    return 'Price range is required.';
  }

  if (payload.category !== 'Tools' && payload.skin.length === 0) {
    return 'Select at least one skin type.';
  }

  if (payload.category !== 'Tools' && payload.concerns_addressed.length === 0) {
    return 'Select at least one concern.';
  }

  return '';
}

function publicProduct(product) {
  const source = product.toObject ? product.toObject() : product;
  const image = source.image || source.imageUrl || source.images?.[0] || '';
  const isBestseller = source.isBestseller || source.isFeatured;

  return {
    id: source._id,
    brand: source.brand,
    name: source.name,
    price: source.price,
    originalPrice: source.originalPrice,
    discount: source.discount,
    stock: source.stock,
    stock_available: source.stock,
    description: source.description,
    ingredients: source.ingredients,
    concerns_addressed: source.concerns_addressed || [],
    volume: source.volume,
    shade: source.shade,
    finish: source.finish,
    suitable_skin_tones: source.suitable_skin_tones || [],
    price_range_tag: source.price_range_tag,
    has_variants: source.has_variants,
    variant_type: source.variant_type,
    variants: source.variants || [],
    subCategory: source.subCategory || source.subcategory,
    image,
    imageUrl: source.imageUrl,
    images: source.images,
    category: source.category,
    cat: source.category,
    skin: source.skin || [],
    isNew: source.isNew,
    isBestseller,
    isFeatured: source.isFeatured,
    createdAt: source.createdAt,
  };
}

router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.bestseller === 'true' || req.query.featured === 'true') {
      query.$or = [{ isBestseller: true }, { isFeatured: true }];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.json({
      products: products.map(publicProduct),
    });
  } catch (error) {
    console.error('Products error:', error);
    return res.status(500).json({ message: 'Unable to load products right now.' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = productPayload(req.body || {});
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.create(payload);

    return res.status(201).json({
      message: 'Product created successfully.',
      product: publicProduct(product),
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Unable to create this product right now.' });
  }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = productPayload(req.body || {});
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({
      message: 'Product updated successfully.',
      product: publicProduct(product),
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Unable to update this product right now.' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Unable to delete this product right now.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({
      product: publicProduct(product),
    });
  } catch (error) {
    console.error('Product detail error:', error);
    return res.status(500).json({ message: 'Unable to load this product right now.' });
  }
});

export default router;
