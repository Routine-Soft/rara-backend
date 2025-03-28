const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const dotenv = require('dotenv');
dotenv.config();

// Configurar AWS SDK
const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Criar o transporter do Nodemailer usando o SES
let transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: require('@aws-sdk/client-ses') }
});

const sendEmail = async (to, subject, body) => {
    try {
        let info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL, // endereço de email verificado no SES
            to: to,
            subject: subject,
            html: body
        });
        console.log('Email sent: ', info);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

module.exports = sendEmail;
