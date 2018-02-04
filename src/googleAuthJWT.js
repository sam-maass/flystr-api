const CLIENT_ID =
  '1059931024943-1u64m1fh6glpodhalllbkbul1hbsdbfh.apps.googleusercontent.com';
const gal = require('google-auth-library');
const client = new gal.OAuth2Client(CLIENT_ID, '', '');

const verifyToken = token => {
  return new Promise((resolve, reject) =>
    client.verifyIdToken(
      {
        idToken: token,
        audience: CLIENT_ID
      },
      (e, login) => {
        if (!login) return reject(new Error('JWT not verified'));
        const payload = login.getPayload();
        resolve(payload);
        // If request specified a G Suite domain:
        //var domain = payload['hd'];
      }
    )
  );
};

module.exports = { verifyToken };
