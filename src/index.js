const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { PORT, MONGO_URL } = process.env;

const app = express();
app.use(morgan('combined'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(require('./routes'));

mongoose.Promise = global.Promise;
mongoose
  .connect(
    MONGO_URL,
    { useNewUrlParser: true }
  )
  .catch(e => console.error(e));

app.listen(PORT);
console.log(`API running on port ${PORT}, mongo connected to ${MONGO_URL}`);
