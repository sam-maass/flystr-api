const unirest = require('unirest');
const { addToSkyscannerQueue } = require('./skyScannerQueue');
console.log(addToSkyscannerQueue);

function querySkyscanner(requestObj) {
  const {
    origin,
    destination,
    outboundPartialDate,
    inboundPartialDate,
    currency
  } = requestObj;
  return new Promise((resolve, reject) => {
    unirest
      .get(
        `https://skyscanner-skyscanner-flight-search-v1.p.mashape.com/apiservices/browsequotes/v1.0/US/${currency}/en-US/${origin}-sky/${destination}-sky/${outboundPartialDate}/${inboundPartialDate}`
      )
      .header('X-Mashape-Key', process.env.SKYSCANNER_KEY)
      .header(
        'X-Mashape-Host',
        'skyscanner-skyscanner-flight-search-v1.p.mashape.com'
      )
      .end(result => {
        addToSkyscannerQueue(requestObj);
        const { status, headers, body } = result;
        if (status === 200) resolve({ status, headers, body });
        else {
          console.error(status, body);
          addToSkyscannerQueue(requestObj);
          reject({ status, headers, body });
        }
      });
  });
}

exports.querySkyscanner = querySkyscanner;
