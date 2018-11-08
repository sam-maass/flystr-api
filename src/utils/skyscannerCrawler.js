import Axios from 'axios';

export const crawler = Axios.create({
  baseURL: process.env.CRAWLER_URL
});
