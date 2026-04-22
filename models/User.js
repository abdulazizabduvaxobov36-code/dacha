import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'oshpaz'], default: 'user' },

    // Qo'shimcha maydonlar (ixtiyoriy)
    phone: { type: String, default: '' },
    image: { type: String, default: '' },
    surname: { type: String, default: '' },
    exp: { type: String, default: '' },
  },
  { timestamps: true }
);

// Saqlashdan oldin parolni hash qilish
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parolni tekshirish metodi
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;