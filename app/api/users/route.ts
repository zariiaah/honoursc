import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions - Admin access required' }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      robloxUsername: true,
      discordUsername: true,
      isAdmin: true,
      permission: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users, { status: 200 });
}