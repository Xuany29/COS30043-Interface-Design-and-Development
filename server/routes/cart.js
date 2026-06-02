import { Router } from 'express';
import mongoose from 'mongoose';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import { requireAuth } from './auth.js';

const router = Router();

function productImage(product) {
  return product.image || product.imageUrl || product.images?.[0] || '';
}

function variantId(variant) {
  return variant.shade_number || variant.shade_name || variant.name;
}

function findProductVariant(product, selectedVariantId) {
  if (!selectedVariantId) {
    return null;
  }

  return product.variants?.find(variant => variantId(variant) === selectedVariantId) || null;
}

function availableStock(product, selectedVariantId = null) {
  const variant = findProductVariant(product, selectedVariantId);

  if (variant) {
    return Number(variant.stock || 0);
  }

  return Number(product.stock || 0);
}

function publicCartItem(item) {
  const product = item.product;
  const selectedVariant = item.selectedVariant;
  const stock = availableStock(product, selectedVariant?.id);

  return {
    id: product._id,
    cartItemId: item._id,
    brand: product.brand,
    name: product.name,
    variant: selectedVariant?.label || product.volume || product.shade || product.subCategory || product.category,
    selectedVariant,
    price: product.price,
    qty: item.qty,
    image: productImage(product),
    stock,
  };
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const items = await CartItem.find({ user: req.user._id })
      .populate('product')
      .sort({ updatedAt: -1 });

    return res.json({
      items: items.filter(item => item.product).map(publicCartItem),
    });
  } catch (error) {
    console.error('Cart load error:', error);
    return res.status(500).json({ message: 'Unable to load cart right now.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, qty = 1, selectedVariant = null } = req.body || {};
    const quantity = Math.max(Number(qty) || 1, 1);

    if (!productId) {
      return res.status(400).json({ message: 'Product id is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.has_variants && product.variants?.length && !selectedVariant?.id) {
      return res.status(400).json({ message: 'Please choose an option before adding this product.' });
    }

    const selectedVariantId = selectedVariant?.id || null;
    const productVariant = findProductVariant(product, selectedVariantId);

    if (selectedVariantId && !productVariant) {
      return res.status(400).json({ message: 'Please choose a valid product option.' });
    }

    const stock = availableStock(product, selectedVariantId);

    const variantData = productVariant
      ? {
          id: selectedVariantId,
          label: [productVariant.shade_number, productVariant.shade_name || productVariant.name].filter(Boolean).join(' '),
          type: product.variant_type || 'option',
          hex: productVariant.hex || '',
        }
      : null;

    let item = await CartItem.findOne({
      user: req.user._id,
      product: product._id,
      'selectedVariant.id': variantData?.id || null,
    });

    const nextQty = (item?.qty || 0) + quantity;

    if (nextQty > stock) {
      return res.status(400).json({
        message: stock > 0 ? `Only ${stock} available for this option.` : 'This option is out of stock.',
      });
    }

    if (item) {
      item.qty += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        user: req.user._id,
        product: product._id,
        qty: quantity,
        selectedVariant: variantData,
      });
    }

    await item.populate('product');

    return res.status(201).json({
      message: 'Product added to cart.',
      item: publicCartItem(item),
    });
  } catch (error) {
    console.error('Cart add error:', error);
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Unable to add item to cart right now.' : error.message,
    });
  }
});

router.patch('/:cartItemId', async (req, res) => {
  try {
    const qty = Number(req.body.qty);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const item = await CartItem.findOne({ user: req.user._id, _id: req.params.cartItemId }).populate('product');

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    const stock = availableStock(item.product, item.selectedVariant?.id);

    if (qty > stock) {
      return res.status(400).json({
        message: stock > 0 ? `Only ${stock} available for this option.` : 'This option is out of stock.',
      });
    }

    item.qty = qty;
    await item.save();

    return res.json({
      item: publicCartItem(item),
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Unable to update cart right now.' : error.message,
    });
  }
});

router.delete('/:cartItemId', async (req, res) => {
  try {
    await CartItem.deleteOne({ user: req.user._id, _id: req.params.cartItemId });
    return res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Cart remove error:', error);
    return res.status(500).json({ message: 'Unable to remove item right now.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user._id });
    return res.json({ message: 'Cart cleared.' });
  } catch (error) {
    console.error('Cart clear error:', error);
    return res.status(500).json({ message: 'Unable to clear cart right now.' });
  }
});

export default router;
