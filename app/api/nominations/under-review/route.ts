import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.permission !== 'Honours Committee' && user.permission !== 'Admin')) {
    return NextResponse.json({ message: 'Insufficient permissions - Honours Committee access required' }, { status: 403 });
  }

  const nominations = await prisma.nomination.findMany({
    where: { status: 'under_review' },
    include: { reviews: true }, // assuming "reviews" is the correct related field name
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(nominations, { status: 200 });
}