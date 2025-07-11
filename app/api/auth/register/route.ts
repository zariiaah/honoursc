import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg'; // PostgreSQL helper
import { hashPassword } from '@/lib/utils'; // Implement this for password hashing

export async function POST(req: Request) {
  const body = await req.json();
  const { robloxUsername, discordUsername, password } = body;

  if (!robloxUsername || !discordUsername || !password) {
    return NextResponse.json({ message: 'Invalid input data' }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { robloxUsername } });
  if (existingUser) {
    return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      robloxUsername,
      discordUsername,
      password: hashedPassword,
      isAdmin: false,
      permission: 'User',
    },
  });

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}