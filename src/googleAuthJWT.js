var CLIENT_ID =
  '1059931024943-1u64m1fh6glpodhalllbkbul1hbsdbfh.apps.googleusercontent.com';
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth();
var client = new auth.OAuth2(CLIENT_ID, '', '');

const verifyToken = token => {
  return new Promise((resolve, reject) =>
    client.verifyIdToken(token, CLIENT_ID, function(e, login) {
      if (!login) return reject(new Error('JWT not verified'));
      var payload = login.getPayload();
      var userid = payload['sub'];
      resolve(payload);
      // If request specified a G Suite domain:
      //var domain = payload['hd'];
    })
  );
};

module.exports = { verifyToken };
