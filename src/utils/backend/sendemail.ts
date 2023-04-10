const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
    },
});

const SendEmail = async (to: string, subject: string, htmlText: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_SMTP_FROM,
        to: to,
        subject: subject,
        html: htmlText,
    });
}

export default SendEmail;