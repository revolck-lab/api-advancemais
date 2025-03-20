const nodemailer = require("nodemailer");
const superAdminService = require("../modules/cms/services/superAdminService");

let transporterPromise = null;

const configSmtp = async () => {
  try {
    const smtp = parseInt(process.env.SMTP_ID, 10);
    const smtpConfig = await superAdminService.getSmtpServerService(smtp);

    if (!smtpConfig) {
      console.warn("⚠️  No SMTP configuration found, emails are disabled.");
      return null;
    }
    
    return smtpConfig;
  } catch (error) {
    console.error("❌ Error fetching SMTP configuration:", error.message);
    return null;
  }
};

const createTransporter = (smtpConfig) => {
  if (!smtpConfig) return null;

  return nodemailer.createTransport({
    host: smtpConfig.smtp_host,
    port: smtpConfig.smtp_port,
    secure: smtpConfig.smtp_port === 465,
    auth: {
      user: smtpConfig.smtp_username,
      pass: smtpConfig.smtp_password,
    },
  });
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = configSmtp()
      .then(createTransporter)
      .catch((err) => {
        console.error("❌ Error configuring SMTP:", err);
        transporterPromise = null; 
        return null;
      });
  }
  return transporterPromise;
};

const verifyConnection = async () => {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("⚠️  No SMTP configured. Email functionality is disabled.");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ SMTP server successfully verified.");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    return false;
  }
};

const resetTransporter = async () => {
  console.log("🔄 Resetting SMTP connection.");
  transporterPromise = null;
  return getTransporter();
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required fields: to, subject, and at least one of text or html.");
  }

  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("⚠️  Email not sent: SMTP is disabled.");
    return { error: "SMTP not configured." };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent: %s", info.messageId);

    return { messageId: info.messageId, to: mailOptions.to };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = { 
  verifyConnection, 
  sendEmail,
  resetTransporter,
};