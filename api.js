const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction } = require('./models');

const app = express();
app.use(express.json());

const secret = 'your_jwt_secret';

// ลงทะเบียน
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.status(201).json({ message: 'User registered' });
});

// เข้าสู่ระบบ
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware สำหรับการตรวจสอบ JWT
const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token is required' });

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// บันทึกรายรับรายจ่าย
app.post('/transactions', auth, async (req, res) => {
  const { amount, date, type, note } = req.body;
  const newTransaction = new Transaction({
    user_id: req.user.id,
    amount,
    date,
    type,
    note,
  });
  await newTransaction.save();
  res.status(201).json({ message: 'Transaction added' });
});

// แสดงรายการบันทึก
app.get('/transactions', auth, async (req, res) => {
  const transactions = await Transaction.find({ user_id: req.user.id });
  res.json(transactions);
});

// ยอดรวมรายรับรายจ่าย
app.get('/balance', auth, async (req, res) => {
  const transactions = await Transaction.find({ user_id: req.user.id });
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;
  res.json({ balance });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const response = await fetch('/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        amount: document.getElementById('amount').value,
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        note: document.getElementById('note').value,
      }),
    });
  
    if (response.ok) {
      alert('บันทึกข้อมูลเรียบร้อย');
    } else {
      alert('เกิดข้อผิดพลาด');
    }
  });
  