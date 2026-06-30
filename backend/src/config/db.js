const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

async function connect() {
  if (!MONGO_URI) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
}

module.exports = { connect };
