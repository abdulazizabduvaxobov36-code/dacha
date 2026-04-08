import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    chefPhone:     { type: String, required: true },
    chefName:      { type: String, default: '' },
    customerPhone: { type: String, required: true },
    customerName:  { type: String, default: '' },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    comment:       { type: String, default: '' },
  },
  { timestamps: true }
);

// Bir mijoz bir oshpazga faqat 1 ta baho qo'ya oladi
reviewSchema.index({ chefPhone: 1, customerPhone: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
