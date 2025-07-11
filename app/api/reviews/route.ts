import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.permission !== 'Honours Committee' && user.permission !== 'Admin')) {
    return NextResponse.json({ message: 'Insufficient permissions - Honours Committee access required' }, { status: 403 });
  }

  const { nominationId, userId, username, comment } = await req.json();

  if (!nominationId || !userId || !username || !comment?.trim()) {
    return NextResponse.json({ message: 'Invalid review data' }, { status: 400 });
  }

  const exists = await db.nomination.findUnique({ where: { id: nominationId } });
  if (!exists) {
    return NextResponse.json({ message: 'Nomination not found' }, { status: 404 });
  }

  const review = await db.reviewComment.create({
    data: { nominationId, userId, username, comment },
  });

  return NextResponse.json(review, { status: 201 });
}