import Axios from 'axios';

export const crawler = Axios.create({
  baseURL: 'web://flystr-crawler:3300'
});
