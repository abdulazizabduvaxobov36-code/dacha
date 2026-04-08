import Chef from '../models/Chef.js';
import Customer from '../models/Customer.js';

// ─── OSHPAZLAR ───────────────────────────────────────────────

// GET /chefs — barcha oshpazlar
export const getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find({ isBlocked: false }).sort({ createdAt: -1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /chefs/:phone — bitta oshpaz
export const getChefByPhone = async (req, res) => {
  try {
    const chef = await Chef.findOne({ phone: req.params.phone });
    res.json(chef || null);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /chefs — oshpaz qo'shish / yangilash
export const upsertChef = async (req, res) => {
  try {
    const { phone, name, surname, exp, image } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone majburiy' });

    const chef = await Chef.findOneAndUpdate(
      { phone },
      { name: name || '', surname: surname || '', exp: exp || '', image: image || '', registeredAt: Date.now() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ ok: true, chef });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PUT /chefs/:phone — oshpaz profilini yangilash
export const updateChef = async (req, res) => {
  try {
    const chef = await Chef.findOneAndUpdate(
      { phone: req.params.phone },
      { ...req.body },
      { new: true }
    );
    if (!chef) return res.status(404).json({ message: 'Oshpaz topilmadi' });
    res.json({ ok: true, chef });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// DELETE /chefs/:phone — oshpazni o'chirish
export const deleteChef = async (req, res) => {
  try {
    await Chef.findOneAndDelete({ phone: req.params.phone });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── MIJOZLAR ─────────────────────────────────────────────────

// POST /customers — mijoz qo'shish / yangilash
export const upsertCustomer = async (req, res) => {
  try {
    const { phone, firstName, lastName, image } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone majburiy' });

    const customer = await Customer.findOneAndUpdate(
      { phone },
      { firstName: firstName || '', lastName: lastName || '', image: image || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ ok: true, customer });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PUT /customers/:phone — mijoz profilini yangilash
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      { ...req.body },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Mijoz topilmadi' });
    res.json({ ok: true, customer });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /customers/:phone — bitta mijoz
export const getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    res.json(customer || null);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /admin/customers — admin uchun barcha mijozlar
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
