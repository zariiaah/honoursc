import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

const validFields = ['Parliamentary and Public Service', 'Military', 'Diplomatic', 'Private Sector'];

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase();
  const field = req.nextUrl.searchParams.get('field');

  const honours = await db.honour.findMany({
    where: {
      ...(search && {
        OR: [
          { robloxUsername: { contains: search, mode: 'insensitive' } },
          { discordUsername: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(field && validFields.includes(field) && { field }),
    },
    orderBy: { awardedAt: 'desc' },
  });

  return NextResponse.json(honours, { status: 200 });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions - Admin access required' }, { status: 403 });
  }

  const { robloxUsername, discordUsername, title, field, description } = await req.json();

  if (!robloxUsername || !discordUsername || !title || !field || !validFields.includes(field)) {
    return NextResponse.json({ message: 'Invalid honour data' }, { status: 400 });
  }

  const honour = await db.honour.create({
    data: {
      robloxUsername,
      discordUsername,
      title,
      field,
      description: description || '',
      awardedAt: new Date(),
    },
  });

  return NextResponse.json(honour, { status: 201 });
}