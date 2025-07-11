import { NextResponse } from 'next/server';
import { db } from '@/lib/database-pg';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
  }

  const nominationId = params.id;
  const body = await req.json();
  const { status } = body;

  if (!['under_review', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
  }

  const updated = await db.nomination.update({
    where: { id: nominationId },
    data: { status },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ message: 'Nomination not found' }, { status: 404 });
  }

  return NextResponse.json({ id: nominationId, status, message: 'Nomination status updated successfully' }, { status: 200 });
}