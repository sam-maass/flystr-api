import { mailer } from './mailer';
const sendWelcomeEmail = function(email) {
  const msg = {
    to: email,
    from: 'sam@flystr.com',
    templateId: 'd-4150aec3e9b44cc6a1219da5616e4301'
  };
  mailer.send(msg);
};

const sendSignupEmail = function(email) {
  const msg = {
    to: email,
    from: 'Flystr.com <flystr@flystr.com>',
    templateId: 'd-de80ce5dbcec4b3ebd9a3c598e60f0c7',
    dynamic_template_data: {
      email
    }
  };
  mailer.send(msg);
};

module.exports = { sendWelcomeEmail, sendSignupEmail };
