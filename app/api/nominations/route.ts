import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const field = searchParams.get('field');

  const filters: any = {};
  if (status) filters.status = status;
  if (field) filters.fields = { has: field };

  const nominations = await db.nomination.findMany({
    where: filters,
    include: {
      reviewComments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(nominations, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nominatorId, nomineeRobloxUsername, fields, description, status } = body;

  if (!nominatorId || !nomineeRobloxUsername || !fields?.length || !description || description.length > 500) {
    return NextResponse.json({ message: 'Invalid nomination data' }, { status: 400 });
  }

  const newNomination = await db.nomination.create({
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