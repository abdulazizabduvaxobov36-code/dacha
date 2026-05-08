import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    phone:   { type: String, required: true },
    name:    { type: String, default: '' },
    role:    { type: String, enum: ['customer', 'chef'], required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    reply:   { type: String, default: '' },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
