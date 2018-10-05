import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = function(email) {
  const msg = {
    to: email,
    from: 'sam@flystr.com',
    templateId: 'd-4150aec3e9b44cc6a1219da5616e4301'
  };
  sgMail.send(msg);
};

const sendSignupEmail = function(email) {
  const msg = {
    to: email,
    from: 'flystr@flystr.com',
    templateId: 'd-de80ce5dbcec4b3ebd9a3c598e60f0c7',
    dynamic_template_data: {
      email
    }
  };
  sgMail.send(msg);
};

module.exports = { sendWelcomeEmail, sendSignupEmail };
