const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: Object,
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
