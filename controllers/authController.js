import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Token yaratish
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── REGISTER ─────────────────────────────────────────────────
// POST /auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Majburiy maydonlar
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Ism, email va parol kiritish shart' });
    }

    // Email band bo'lsa
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    // Role tekshirish
    const allowedRoles = ['user', 'oshpaz'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // Foydalanuvchi yaratish
    const user = await User.create({ name, email, password, role: userRole });

    res.status(201).json({
      message: 'Ro\'yxatdan o\'tildi',
      token: generateToken(user._id),
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va parol kiritish shart' });
    }

    // Foydalanuvchini topish
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    // Parolni tekshirish
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    res.json({
      message: 'Muvaffaqiyatli kirildi',
      token: generateToken(user._id),
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── GET ME ───────────────────────────────────────────────────
// GET /auth/me  (token bilan)
export const getMe = async (req, res) => {
  try {
    const user = req.user; // middleware dan keladi
    res.json({
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      phone:   user.phone,
      image:   user.image,
      surname: user.surname,
      exp:     user.exp,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────
// POST /auth/logout  (frontend tokenni o'chiradi, bu endpoint log uchun)
export const logout = async (req, res) => {
  res.json({ message: 'Chiqildi. Tokenni frontendda o\'chirib tashlang.' });
};
