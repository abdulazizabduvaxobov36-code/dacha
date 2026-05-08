import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    telegramId: { type: String, unique: true, required: true },
    phone:      { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('TelegramPhone', schema);
