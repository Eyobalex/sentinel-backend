require("dotenv").config();

const { Resend } = require("resend");
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// console.log("🚀 ~ RESEND_API_KEY:", RESEND_API_KEY);
const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.ALERT_EMAIL_FROM,
      to: [process.env.ALERT_EMAIL_TO],
      subject: "Test Email from Sentinel",
      html: "This is a test email from the Sentinel security system.",
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Test email sent successfully!");
    }
  } catch (error) {
    console.error("Resend Exception:", error);
  }
}

sendTestEmail();
