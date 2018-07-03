const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally

const sendWelcomeEmail = function(email) {
  const msg = {
    to: email,
    from: 'sam@flystr.com',
    templateId: 'c2d3dfde-b2c4-4b6c-b44b-cac1dc5b34fd'
  };
  sgMail.send(msg);
};

module.exports = { sendWelcomeEmail };
