import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import jwt from 'jsonwebtoken';
// We have removed the import for 'headers' from 'next/headers'

const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export async function GET(request: Request) { // The 'request' object is passed in here
  await dbConnect();

  try {
    // This is the corrected, more reliable way to get the header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const reports = await Report.find({ submittedBy: userId }).sort({ createdAt: -1 });

    return NextResponse.json(reports, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ message: 'An error occurred while fetching reports.' }, { status: 500 });
  }
}