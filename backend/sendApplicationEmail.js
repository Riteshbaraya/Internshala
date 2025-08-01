const nodemailer = require('nodemailer');
const emailConfig = require('./emailConfig');

// Configure your transporter (use Gmail app password for security)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

/**
 * Send application confirmation email to user
 * @param {string} userEmail
 * @param {string} userName
 * @param {string} jobTitle
 * @param {string} companyName
 * @param {string} appliedDate (ISO string or Date)
 */
async function sendApplicationEmail(userEmail, userName, jobTitle, companyName, appliedDate) {
  const formattedDate = new Date(appliedDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const mailOptions = {
    from: emailConfig.user,
    to: userEmail,
    subject: `✅ Application Submitted for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>Hi <b>${userName}</b>,</p>
        <p>Thank you for applying to <b>${jobTitle}</b> at <b>${companyName}</b> through our platform.</p>
        <p>We have successfully received your application on <b>${formattedDate}</b>.</p>
        <ul style="list-style:none;padding:0;">
          <li>📄 <b>Position:</b> ${jobTitle}</li>
          <li>🏢 <b>Company:</b> ${companyName}</li>
          <li>📅 <b>Applied On:</b> ${formattedDate}</li>
          <li>📌 <b>Status:</b> Pending Review</li>
        </ul>
        <p>You will be notified once the recruiter reviews your application.</p>
        <br/>
        <p>Best regards,<br/>InternArea Team<br/><a href="https://www.internarea.com">www.internarea.com</a></p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to', userEmail);
  } catch (err) {
    console.error('Error sending confirmation email:', err);
  }
}

module.exports = sendApplicationEmail;