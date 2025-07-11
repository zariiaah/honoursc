import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { nominationId: string } }) {
  const user = await getCurrentUser();

  if (!user || (user.permission !== 'Honours Committee' && user.permission !== 'Admin')) {
    return NextResponse.json({ message: 'Insufficient permissions - Honours Committee access required' }, { status: 403 });
  }

  const nomination = await db.nomination.findUnique({
    where: { id: params.nominationId },
  });

  if (!nomination) {
    return NextResponse.json({ message: 'Nomination not found' }, { status: 404 });
  }

  const comments = await db.reviewComment.findMany({
    where: { nominationId: params.nominationId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(comments, { status: 200 });
}