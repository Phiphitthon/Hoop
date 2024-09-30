const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
});

const transactionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  date: Date,
  type: String,
  note: String,
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { User, Transaction };
