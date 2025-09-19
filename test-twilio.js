import twilio from "twilio";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("ENV CHECK:", {
  SID: process.env.TWILIO_ACCOUNT_SID,
  FROM: process.env.TWILIO_PHONE_NUMBER,
  TO: process.env.ALERT_RECEIVER_PHONE,
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS() {
  try {
    const message = await client.messages.create({
      body: "🌊 Ocean Guardian Alert: Test SMS",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ALERT_RECEIVER_PHONE,
    });

    console.log("✅ Message sent successfully! SID:", message.sid);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

sendSMS();
