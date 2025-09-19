import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SocialMention from '@/models/SocialMention';
import jwt from 'jsonwebtoken';

// Helper function to verify token and role
const isOfficial = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    return decoded.role === 'official';
  } catch (error) {
    return false;
  }
};

// Ensure this is a NAMED export, not a default one
export async function GET(request: Request) {
  await dbConnect();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Verify user is an official
    if (!isOfficial(token)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const mentions = await SocialMention.find({}).sort({ created_at: -1 }).limit(50);
    return NextResponse.json(mentions, { status: 200 });

  } catch (error) {
    console.error("Error fetching social mentions:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}