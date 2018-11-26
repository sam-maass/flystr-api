import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const ADMIN_EMAIL = 'sam.p.d.maass@gmail.com';

const mailer = { ...sgMail };
if (process.env.NODE_ENV !== 'production') {
  mailer.send = msg => {
    if (msg.to === ADMIN_EMAIL) {
      sgMail.send(msg);
    } else {
      console.log('DEV_MODE: Not sending mail', { msg });
    }
  };
}

export { mailer };
