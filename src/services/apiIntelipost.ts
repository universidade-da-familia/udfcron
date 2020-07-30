import axios from 'axios';

const apiIntelipost = axios.create({
  baseURL: 'https://api.intelipost.com.br/api/v1',
  timeout: 30000,
});

export default apiIntelipost;
