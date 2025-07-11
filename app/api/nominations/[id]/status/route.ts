import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const nomination = await prisma.nomination.findUnique({
      where: { id },
    });

    if (!nomination) {
      return NextResponse.json({ error: 'Nomination not found' }, { status: 404 });
    }

    return NextResponse.json({ nomination }, { status: 200 });
  } catch (error) {
    console.error('Error fetching nomination:', error);
    return NextResponse.json({ error: 'Failed to fetch nomination' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions - Admin access required' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();

    // Allow only specific fields to be updated, for example:
    const allowedFields = ['status', 'fields', 'description', 'nomineeRobloxUsername'];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedNomination = await prisma.nomination.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ nomination: updatedNomination }, { status: 200 });
  } catch (error) {
    console.error('Error updating nomination:', error);
    return NextResponse.json({ error: 'Failed to update nomination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.permission !== 'Admin') {
    return NextResponse.json({ message: 'Insufficient permissions - Admin access required' }, { status: 403 });
  }

  try {
    const { id } = params;
    await prisma.nomination.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Nomination deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting nomination:', error);
    return NextResponse.json({ error: 'Failed to delete nomination' }, { status: 500 });
  }
}