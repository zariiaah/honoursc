import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/utils';

export async function POST(req: Request) {
  const { robloxUsername, discordUsername, password } = await req.json();

  if (!robloxUsername || !discordUsername || !password) {
    return NextResponse.json({ message: 'Invalid input data' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { robloxUsername },
  });

  if (existingUser) {
    return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
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