import 'babel-polyfill';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { graphqlSchema } from './graphql/schema';
const { ApolloServer } = require('apollo-server-express');

const server = new ApolloServer({ schema: graphqlSchema });

const { PORT, MONGO_URL } = process.env;

const app = express();
server.applyMiddleware({ app });
app.use(
  morgan('dev', {
    skip(req, res) {
      return res.statusCode < 400;
    }
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Max-Age', '600');
  next();
});

app.use(require('./routes'));

mongoose.Promise = global.Promise;
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true })
  .catch(e => console.error(e));

app.listen({ port: PORT }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(`API running on port ${PORT}, mongo connected to ${MONGO_URL}`);
});
