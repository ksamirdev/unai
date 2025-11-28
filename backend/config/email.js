const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({  // Fixed: createTransport (not createTransporter)
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp, type = 'verification') => {
  const subject = type === 'reset' ? 'Password Reset OTP - UnAI' : 'Account Verification OTP - UnAI';
  const message = type === 'reset' 
    ? `Your password reset OTP is: ${otp}. This OTP will expire in 10 minutes.`
    : `Your verification OTP is: ${otp}. This OTP will expire in 10 minutes.`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e5e5e5;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px; text-align: center;">
          <h1 style="color: #20b2aa; margin: 0; font-size: 28px;">UnAI</h1>
          <p style="color: #888; margin: 5px 0;">Deepfake Detection & Image Regeneration</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #20b2aa; margin-bottom: 20px;">${subject}</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">${message}</p>
          <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center; border: 1px solid #333;">
            <p style="margin: 0 0 15px 0; color: #888;">Your OTP Code:</p>
            <h1 style="font-size: 32px; color: #20b2aa; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; margin: 0; font-size: 12px;">Created by Varun Kumar, Bhaumik & Krish</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
