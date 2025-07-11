import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.permission !== 'Honours Committee' && user.permission !== 'Admin')) {
    return NextResponse.json({ message: 'Insufficient permissions - Honours Committee access required' }, { status: 403 });
  }

  const nominations = await db.nomination.findMany({
    where: { status: 'under_review' },
    include: { reviewComments: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(nominations, { status: 200 });
}