import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const field = searchParams.get('field');

  const whereClause: any = {};

  if (status) whereClause.status = status;
  if (field) whereClause.fields = { has: field };

  const nominations = await prisma.nomination.findMany({
    where: whereClause,
    include: {
      reviews: true,  // includes all review comments
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(nominations, { status: 200 });
}

export async function POST(req: Request) {
  const { nominatorId, nomineeRobloxUsername, fields, description, status } = await req.json();

  if (!nominatorId || !nomineeRobloxUsername || !fields?.length || !description || description.length > 500) {
    return NextResponse.json({ message: 'Invalid nomination data' }, { status: 400 });
  }

  const newNomination = await prisma.nomination.create({
    data: {
      nominatorId,
      nomineeRobloxUsername,
      fields,
      description,
      status: status || 'pending',
    },
  });

  return NextResponse.json(newNomination, { status: 201 });
}