import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
}

const getUserFromToken = (token: string): TokenPayload | null => {
  try { return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload; }
  catch (error) { return null; }
};

// GET handler to fetch a single report by its ID
export async function GET(request: Request) { // We no longer need the params argument here
  await dbConnect();
  try {
    // This is the new, more reliable way to get the ID
    const id = request.url.split('/').pop();

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const user = getUserFromToken(token!);

    if (!user || user.role !== 'official') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const report = await Report.findById(id).populate('submittedBy', 'name email');
    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT handler to update a report's status
export async function PUT(request: Request) { // We no longer need the params argument here
  await dbConnect();
  try {
    // This is the new, more reliable way to get the ID
    const id = request.url.split('/').pop();

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const user = getUserFromToken(token!);

    if (!user || user.role !== 'official') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { status } = await request.json();
    if (!['verified', 'dismissed', 'investigating', 'pending'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    ).populate('submittedBy', 'name email'); // Also populate on update

    if (!updatedReport) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report status updated', report: updatedReport }, { status: 200 });
  
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}