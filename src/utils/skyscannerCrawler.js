import Axios from 'axios';

export const crawler = Axios.create({
  // baseURL: 'http://localhost:3300'
  baseURL: 'web://flystr-crawler:3300'
});
