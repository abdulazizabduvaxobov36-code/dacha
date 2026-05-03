import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  text:   { type: String, default: '' },
  sender: { type: String, default: '' }, // 'customer' | 'chef'
  from:   { type: String, default: '' },
  to:     { type: String, default: '' },
  ts:     { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
