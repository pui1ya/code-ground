const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  author: String,
  text: String,
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
