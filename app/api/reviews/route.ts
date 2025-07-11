import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nominationId = searchParams.get('nominationId');

  if (!nominationId) {
    return NextResponse.json({ message: 'nominationId required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { nominationId: Number(nominationId) },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(reviews, { status: 200 });
}

export async function POST(req: Request) {
  const { nominationId, userId, username, comment } = await req.json();

  if (!nominationId || !userId || !username || !comment) {
    return NextResponse.json({ message: 'Invalid review comment data' }, { status: 400 });
  }

  const newReview = await prisma.review.create({
    data: {
      nominationId,
      userId,
      username,
      comment,
    },
  });

  return NextResponse.json(newReview, { status: 201 });
}