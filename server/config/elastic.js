const { Client } = require('@elastic/elasticsearch');
require('dotenv').config({ path: '.env' });

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: { 
    username: process.env.USER_ELASTIC, 
    password: process.env.PASS_ELASTIC 
  },
});

module.exports = client;