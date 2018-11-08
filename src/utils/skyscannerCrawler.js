import Axios from 'axios';
console.log(`CRAWLER_URL: ${process.env.CRAWLER_URL}`);

export const crawler = Axios.create({
  baseURL: process.env.CRAWLER_URL
});
