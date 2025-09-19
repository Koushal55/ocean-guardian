import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import User from '@/models/User'; // <-- Add this import
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
}

const getUserFromToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export async function GET(request: Request) {
  await dbConnect();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = getUserFromToken(token);

    if (!user || user.role !== 'official') {
      return NextResponse.json({ message: 'Access denied: Officials only' }, { status: 403 });
    }

    const reports = await Report.find({})
      .populate('submittedBy', 'name') // This will now work correctly
      .sort({ createdAt: -1 });

    return NextResponse.json(reports, { status: 200 });

  } catch (error) {
    console.error("Error fetching all reports:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}