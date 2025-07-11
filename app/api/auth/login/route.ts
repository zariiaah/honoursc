import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { comparePasswords } from '@/lib/utils';

export async function POST(req: Request) {
  const body = await req.json();
  const { robloxUsername, password } = body;

  if (!robloxUsername || !password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { robloxUsername } });
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await comparePasswords(password, user.password);
  if (!valid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 200 });
}