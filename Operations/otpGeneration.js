let otpGenerator = require('otp-generator');
let nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (email) => {

    let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false , alphabets: false });

    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        secure: true,
        auth: {
            type: 'login',
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
      
    let mailDetails = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verify Login',
        text: "New Login! Verify your account using this OTP: " + otp.toLocaleString()
    };
      
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error: ', err);
        } else {
            console.log('Email sent successfully');
        }
    });

    return otp;
}

