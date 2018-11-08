import Axios from 'axios';
const baseURL = process.env.CRAWLER_URL;
console.log(`CRAWLER_URL: ${baseURL}`);

export const crawler = Axios.create({
  baseURL
});
