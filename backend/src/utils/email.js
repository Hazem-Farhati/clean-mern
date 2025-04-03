const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 👈 Use environment variables
    pass: process.env.EMAIL_PASS, // 👈 Store credentials securely
    },
  
});

console.log("Email credentials loaded:", {
  user: process.env.EMAIL_USER, // This will print the email being used
  pass: process.env.EMAIL_PASS, // Avoid printing the actual password for security reasons
});
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
console.log(mailOptions, "mailOptions");
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to", to);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

module.exports = sendEmail;
