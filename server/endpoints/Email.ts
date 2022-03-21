import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

// https://yarnpkg.com/package/@types/nodemailer
// https://nodemailer.com/about/
// https://www.cloudmailin.com/blog/sending_and_receiving_email_in_node_2021

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword',
  },
});

const mailOptions = {
  from: 'hello@cornelldti.org',
  to: 'sj598@cornell.edu, fl328@cornell.edu, to98@cornell.edu',
  subject: 'Email testing from CU Reviews',
  text: 'testing body',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Email sent: ${info.response}`);
  }
});
