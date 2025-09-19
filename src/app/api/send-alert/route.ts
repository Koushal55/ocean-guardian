export const runtime = "nodejs"; // ✅ force Node runtime

import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const sms = await client.messages.create({
      body: message || "Ocean Hazard Alert from Ocean Guardian!",
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: process.env.ALERT_RECEIVER_PHONE!,
    });

    return NextResponse.json({ success: true, sid: sms.sid });
  } catch (error: any) {
    console.error("Twilio Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
