const nodemailer = require('nodemailer');
const emailConfig = require('../emailConfig');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

/**
 * Send OTP email for Chrome browser verification
 */
async function sendOTPEmail(userEmail, userName, otp) {
  const mailOptions = {
    from: emailConfig.user,
    to: userEmail,
    subject: '🔐 OTP Verification Required - InternArea',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔐 OTP Verification Required</h2>
        <p>Hi <b>${userName}</b>,</p>
        <p>You are logging in from Chrome browser. For security purposes, please enter the following OTP to complete your login:</p>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP is valid for 5 minutes only</li>
          <li>Do not share this OTP with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
        
        <p>Best regards,<br/>InternArea Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', userEmail);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send subscription confirmation email
 */
async function sendSubscriptionEmail(userEmail, userName, planName, amount, invoiceId, validTill) {
  const mailOptions = {
    from: emailConfig.user,
    to: userEmail,
    subject: `✅ Subscription Successful - ${planName} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Subscription Successful</h2>
        <p>Hi <b>${userName}</b>,</p>
        <p>Thank you for subscribing to the <b>${planName}</b> Plan!</p>
        
        <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669;">
          <h3 style="color: #059669; margin-top: 0;">📋 Subscription Details</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
          <p><strong>Invoice ID:</strong> ${invoiceId}</p>
          <p><strong>Valid Till:</strong> ${new Date(validTill).toLocaleDateString('en-IN')}</p>
        </div>
        
        <p>You can now apply to more jobs and internships according to your plan limits.</p>
        
        <p>Best regards,<br/>InternArea Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription email sent to', userEmail);
    return true;
  } catch (error) {
    console.error('Error sending subscription email:', error);
    return false;
  }
}

module.exports = {
  sendOTPEmail,
  sendSubscriptionEmail
}; 