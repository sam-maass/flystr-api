import Axios from 'axios';

export const crawler = Axios.create({
  baseURL: 'http://web:3300'
});
