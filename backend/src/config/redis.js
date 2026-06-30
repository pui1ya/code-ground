const { createClient } = require('redis');
const { REDIS_URL } = require('./env');

let client;

function getClient() {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on('error', (err) => console.error('Redis Client Error', err));
  }
  return client;
}

module.exports = { getClient };
