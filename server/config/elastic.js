import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: { 
    username: process.env.USER_ELASTIC, 
    password: process.env.PASS_ELASTIC 
  },
});

export default client;
