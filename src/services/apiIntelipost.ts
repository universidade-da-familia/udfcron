import axios from 'axios';
import api from './api';

const apiIntelipost = axios.create({
  baseURL: 'https://api.intelipost.com.br/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.INTELIPOST_API_KEY,
  },
});

export default apiIntelipost;
