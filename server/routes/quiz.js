import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

const budgetRanges = {
  low: { max: 50 },
  mid: { min: 50, max: 100 },
  high: { min: 100 },
};

function publicProduct(product, matchScore, routineStep, matchReasons) {
  const image = product.image || product.imageUrl || product.images?.[0] || '';

  return {
    id: product._id,
    brand: product.brand,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    stock: product.stock,
    description: product.description,
    ingredients: product.ingredients,
    concerns_addressed: product.concerns_addressed || [],
    volume: product.volume,
    subCategory: product.subCategory,
    image,
    imageUrl: product.imageUrl,
    images: product.images,
    category: product.category,
    skin: product.skin || [],
    isNew: product.isNew,
    isBestseller: product.isBestseller || product.isFeatured,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    matchScore,
    routineStep,
    matchReasons,
  };
}

function routineStepFor(product) {
  const text = [product.name, product.subCategory, product.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('cleanser') || text.includes('cleansing')) return 'Cleanse';
  if (text.includes('toner') || text.includes('essence')) return 'Prep';
  if (text.includes('serum') || text.includes('ampoule') || text.includes('treatment')) return 'Treat';
  if (text.includes('moistur') || text.includes('cream') || text.includes('lotion')) return 'Moisturize';
  if (text.includes('sunscreen') || text.includes('spf') || text.includes('sun')) return 'Protect';
  if (text.includes('mask') || text.includes('exfol')) return 'Weekly Care';

  return 'Support';
}

function budgetMatches(price, budget) {
  const range = budgetRanges[budget];

  if (!range) return true;
  if (range.min != null && price < range.min) return false;
  if (range.max != null && price > range.max) return false;

  return true;
}

function scoreProduct(product, answers) {
  const skin = product.skin || [];
  const concerns = product.concerns_addressed || [];
  const selectedConcerns = Array.isArray(answers.concerns) ? answers.concerns : [];
  const matchReasons = [];
  let score = 20;

  if (skin.includes(answers.skinType)) {
    score += 30;
    matchReasons.push(`suits ${answers.skinType} skin`);
  }

  const concernMatches = concerns.filter(concern => selectedConcerns.includes(concern));

  if (concernMatches.length > 0) {
    score += concernMatches.length * 18;
    matchReasons.push(`targets ${concernMatches.join(', ')}`);
  }

  if (budgetMatches(product.price, answers.budget)) {
    score += 16;
    matchReasons.push('fits your budget');
  }

  if (product.isBestseller || product.isFeatured) {
    score += 8;
  }

  return {
    score: Math.min(score, 98),
    matchReasons,
  };
}

router.post('/recommend', async (req, res) => {
  try {
    const answers = req.body || {};

    if (!answers.skinType) {
      return res.status(400).json({ message: 'Skin type is required.' });
    }

    if (!Array.isArray(answers.concerns) || answers.concerns.length === 0) {
      return res.status(400).json({ message: 'Choose at least one skin concern.' });
    }

    const products = await Product.find({ category: 'Skincare' }).sort({ isFeatured: -1, isBestseller: -1 });
    const strictMatches = products.filter(product => {
      const skinMatch = product.skin?.includes(answers.skinType);
      const concernMatch = product.concerns_addressed?.some(concern => answers.concerns.includes(concern));
      const priceMatch = budgetMatches(product.price, answers.budget);

      return skinMatch && concernMatch && priceMatch;
    });

    const pool = strictMatches.length >= 4 ? strictMatches : products;
    const limit = answers.routineSize === 'simple' ? 4 : 8;

    const recommendations = pool
      .map(product => {
        const { score, matchReasons } = scoreProduct(product, answers);
        return publicProduct(product, score, routineStepFor(product), matchReasons);
      })
      .sort((a, b) => b.matchScore - a.matchScore || Number(b.isFeatured) - Number(a.isFeatured))
      .slice(0, limit);

    return res.json({
      answers,
      products: recommendations,
      routine: ['Cleanse', 'Prep', 'Treat', 'Moisturize', 'Protect', 'Weekly Care', 'Support']
        .map(step => ({
          step,
          products: recommendations.filter(product => product.routineStep === step),
        }))
        .filter(group => group.products.length > 0),
    });
  } catch (error) {
    console.error('Quiz recommendation error:', error);
    return res.status(500).json({ message: 'Unable to build your skincare routine right now.' });
  }
});

export default router;
