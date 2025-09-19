import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import jwt from 'jsonwebtoken';
// We no longer need to import 'headers' from 'next/headers'

const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export async function POST(request: Request) {
  await dbConnect();

  try {
    // This is the new, more reliable way to get headers
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or invalid' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { hazardType, description, location, urgency, vesselInfo, coordinates } = body;

    const newReport = new Report({
      hazardType,
      description,
      location,
      urgency,
      vesselInfo,
      coordinates,
      submittedBy: userId,
    });

    await newReport.save();

    return NextResponse.json({ message: 'Report submitted successfully.', report: newReport }, { status: 201 });

  } catch (error) {
    console.error('Report submission error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ message: 'An error occurred while submitting the report.' }, { status: 500 });
  }
}