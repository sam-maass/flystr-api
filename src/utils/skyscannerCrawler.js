import Axios from 'axios';
const baseURL = process.env.CRAWLER_URL;
export const crawler = Axios.create({
  baseURL
});
