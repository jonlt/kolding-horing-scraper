const nodemailer = require('nodemailer');

let transport;
const createTransport = async () => {
    transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == "465", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
    });
}

const sendSingleMail = async (message) => {
    return new Promise((resolve, reject) => {
        transport.sendMail(message, function (err, info) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const sendMail = async (title, content) => {

    const emails = process.env.EMAIL_TO.split(" ");
    for (let i = 0; i < emails.length; i++) {
        const emailTo = emails[i];

        const message = {
            from: process.env.EMAIL_FROM,
            to: emailTo,
            subject: title,
            html: content
        };

        await sendSingleMail(message);
    }
}


exports.init = createTransport;
exports.send = sendMail;
