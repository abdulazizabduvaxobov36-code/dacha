import Review from '../models/Review.js';

// ─── BAHO QO'SHISH ────────────────────────────────────────────
// POST /reviews
export const addReview = async (req, res) => {
  try {
    const { chefPhone, chefName, customerPhone, customerName, rating, comment } = req.body;

    if (!chefPhone || !customerPhone || !rating) {
      return res.status(400).json({ message: 'chefPhone, customerPhone va rating majburiy' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Reyting 1 dan 5 gacha bo\'lishi kerak' });
    }

    // Avval bor bo'lsa yangilaymiz, bo'lmasa yaratamiz
    const review = await Review.findOneAndUpdate(
      { chefPhone, customerPhone },
      { chefName: chefName || '', customerName: customerName || '', rating, comment: comment || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ ok: true, review });
  } catch (err) {
    console.error('addReview error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── OSHPAZNING BAHOLARINI OLISH ─────────────────────────────
// GET /reviews/:chefPhone
export const getChefReviews = async (req, res) => {
  try {
    const { chefPhone } = req.params;
    const reviews = await Review.find({ chefPhone }).sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      reviews,
      avgRating: Number(avgRating),
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error('getChefReviews error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── MIJOZNING OSHPAZGA BAHOSI ───────────────────────────────
// GET /reviews/:chefPhone/customer/:customerPhone
export const getCustomerReview = async (req, res) => {
  try {
    const { chefPhone, customerPhone } = req.params;
    const review = await Review.findOne({ chefPhone, customerPhone });
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
