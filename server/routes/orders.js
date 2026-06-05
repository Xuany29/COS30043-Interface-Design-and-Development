import { Router } from 'express';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin, requireAuth } from './auth.js';

const router = Router();

function productImage(product) {
  return product.image || product.imageUrl || product.images?.[0] || '';
}

function productVariant(product) {
  return product.volume || product.shade || product.subCategory || product.category || '';
}

function variantId(variant) {
  return variant.shade_number || variant.shade_name || variant.name;
}

function variantLabel(variant) {
  return [variant.shade_number, variant.shade_name || variant.name].filter(Boolean).join(' ');
}

function findProductVariant(product, selectedVariantId) {
  if (!selectedVariantId) {
    return null;
  }

  return product.variants?.find(variant => variantId(variant) === selectedVariantId) || null;
}

function findProductVariantByLabel(product, label) {
  if (!label) {
    return null;
  }

  return product.variants?.find(variant => variantLabel(variant) === label) || null;
}

function availableStock(product, selectedVariantId = null) {
  const variant = findProductVariant(product, selectedVariantId);

  if (variant) {
    return Number(variant.stock || 0);
  }

  return Number(product.stock || 0);
}

function calculateShipping(subtotal) {
  return subtotal >= 120 || subtotal === 0 ? 0 : 12;
}

function makeTransactionId() {
  return `BP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function publicOrder(order) {
  return {
    id: order._id,
    transactionId: order.payment.transactionId,
    date: order.createdAt,
    customer: order.customer,
    user: order.user,
    items: order.items.map(item => ({
      name: item.name,
      brand: item.brand,
      variant: item.variant,
      qty: item.qty,
      price: item.price,
      image: item.image,
    })),
    itemSummary: order.items.map(item => `${item.name} x${item.qty}`).join(', '),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    paymentStatus: order.payment.status,
    paymentMethod: order.payment.method,
    shippingAddress: order.shippingAddress,
    updatedAt: order.updatedAt,
  };
}

router.use(requireAuth);

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.json({
      orders: orders.map(publicOrder),
    });
  } catch (error) {
    console.error('Admin order load error:', error);
    return res.status(500).json({ message: 'Unable to load orders right now.' });
  }
});

router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  try {
    const allowedStatuses = ['processing', 'packed', 'shipped', 'completed', 'cancelled'];
    const status = String(req.body?.status || '').trim();

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Please choose a valid order status.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled orders cannot be updated.' });
    }

    order.status = status;
    await order.save();

    return res.json({
      message: 'Order status updated.',
      order: publicOrder(order),
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return res.status(500).json({ message: 'Unable to update order right now.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.json({
      orders: orders.map(publicOrder),
    });
  } catch (error) {
    console.error('Order load error:', error);
    return res.status(500).json({ message: 'Unable to load your orders right now.' });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'processing') {
      return res.status(400).json({ message: 'Only processing orders can be cancelled.' });
    }

    order.status = 'cancelled';
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        continue;
      }

      const variant = product.has_variants ? findProductVariantByLabel(product, item.variant) : null;

      if (variant) {
        variant.stock = Number(variant.stock || 0) + item.qty;
      } else {
        product.stock = Number(product.stock || 0) + item.qty;
      }

      await product.save();
    }

    return res.json({
      message: 'Order cancelled.',
      order: publicOrder(order),
    });
  } catch (error) {
    console.error('Order cancel error:', error);
    return res.status(500).json({ message: 'Unable to cancel this order right now.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer = {}, shippingAddress = {}, payment = {} } = req.body || {};
    const requiredCustomerFields = ['name', 'email', 'phone'];
    const requiredAddressFields = ['address', 'city', 'postcode', 'state'];

    const missingCustomerField = requiredCustomerFields.find(field => !customer[field]?.trim());
    const missingAddressField = requiredAddressFields.find(field => !shippingAddress[field]?.trim());

    if (missingCustomerField || missingAddressField) {
      return res.status(400).json({ message: 'Please complete your contact and shipping details.' });
    }

    if (!['card', 'online-banking', 'ewallet'].includes(payment.method)) {
      return res.status(400).json({ message: 'Please choose a valid payment method.' });
    }

    if (payment.method === 'card' && !/^\d{4}$/.test(String(payment.cardLast4 || ''))) {
      return res.status(400).json({ message: 'Please enter the last 4 digits of your card.' });
    }

    const cartItems = await CartItem.find({ user: req.user._id }).populate('product');
    const validCartItems = cartItems.filter(item => item.product);

    if (!validCartItems.length) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    for (const item of validCartItems) {
      const stock = availableStock(item.product, item.selectedVariant?.id);

      if (item.qty > stock) {
        return res.status(400).json({
          message: stock > 0
            ? `Only ${stock} available for ${item.product.name}${item.selectedVariant?.label ? ` - ${item.selectedVariant.label}` : ''}.`
            : `${item.product.name}${item.selectedVariant?.label ? ` - ${item.selectedVariant.label}` : ''} is out of stock.`,
        });
      }
    }

    const items = validCartItems.map(item => ({
      product: item.product._id,
      brand: item.product.brand,
      name: item.product.name,
      variant: item.selectedVariant?.label || productVariant(item.product),
      price: item.product.price,
      qty: item.qty,
      image: productImage(item.product),
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    const order = await Order.create({
      user: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        postcode: shippingAddress.postcode.trim(),
        state: shippingAddress.state.trim(),
      },
      items,
      payment: {
        method: payment.method,
        status: 'paid',
        transactionId: makeTransactionId(),
        cardLast4: payment.method === 'card' ? String(payment.cardLast4) : undefined,
      },
      subtotal,
      shipping,
      total,
    });

    for (const item of validCartItems) {
      const variant = findProductVariant(item.product, item.selectedVariant?.id);

      if (variant) {
        variant.stock = Math.max(Number(variant.stock || 0) - item.qty, 0);
      } else {
        item.product.stock = Math.max(Number(item.product.stock || 0) - item.qty, 0);
      }

      await item.product.save();
    }

    await CartItem.deleteMany({ user: req.user._id });

    return res.status(201).json({
      message: 'Payment successful. Your order has been placed.',
      order: {
        id: order._id,
        transactionId: order.payment.transactionId,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order create error:', error);
    return res.status(500).json({ message: 'Unable to place your order right now.' });
  }
});

export default router;
