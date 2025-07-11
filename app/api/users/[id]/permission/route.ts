import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const { id } = params;
  const { permission } = await req.json();

  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions - Admin access required' }, { status: 403 });
  }

  if (!['User', 'Honours Committee', 'Admin'].includes(permission)) {
    return NextResponse.json({ message: 'Invalid permission level' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      permission,
      isAdmin: permission === 'Admin',
    },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ id, permission, message: 'User permission updated successfully' }, { status: 200 });
}