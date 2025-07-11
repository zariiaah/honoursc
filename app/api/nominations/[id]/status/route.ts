import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const nomination = await prisma.nomination.findUnique({
      where: { id },
    });

    if (!nomination) {
      return NextResponse.json({ error: 'Nomination not found' }, { status: 404 });
    }

    return NextResponse.json({ nomination });
  } catch (error) {
    console.error('Error fetching nomination:', error);
    return NextResponse.json({ error: 'Failed to fetch nomination' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate fields if needed, e.g., only allow certain fields to be updated

    const updatedNomination = await prisma.nomination.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ nomination: updatedNomination });
  } catch (error) {
    console.error('Error updating nomination:', error);
    return NextResponse.json({ error: 'Failed to update nomination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.nomination.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Nomination deleted successfully' });
  } catch (error) {
    console.error('Error deleting nomination:', error);
    return NextResponse.json({ error: 'Failed to delete nomination' }, { status: 500 });
  }
}