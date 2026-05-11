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

    // Har safar yangi baho yaratamiz (bir mijoz ko'p baho qoldira oladi)
    const review = await Review.create({
      chefPhone, customerPhone,
      chefName: chefName || '',
      customerName: customerName || '',
      rating,
      comment: comment || '',
    });

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

// ─── BITTA IZOHNI O'CHIRISH ───────────────────────────────────
// DELETE /reviews/:id
export const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── BARCHA IZOHLAR (ADMIN) ───────────────────────────────────
// GET /reviews/admin/all
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── MIJOZNING OSHPAZGA BAHOLARI ─────────────────────────────
// GET /reviews/:chefPhone/customer/:customerPhone
export const getCustomerReview = async (req, res) => {
  try {
    const { chefPhone, customerPhone } = req.params;
    const reviews = await Review.find({ chefPhone, customerPhone }).sort({ createdAt: -1 });
    res.json(reviews); // array qaytaradi
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};