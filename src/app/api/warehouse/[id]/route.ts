// app/api/warehouse/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await prisma.warehouse.delete({ where: { id } })
  return NextResponse.json({ message: 'Silindi' })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const body = await req.json()
  const { capacity, currentStock } = body
  const updated = await prisma.warehouse.update({
    where: { id },
    data: {
      capacity: Number(capacity),
      currentStock: Number(currentStock),
    },
  })
  return NextResponse.json(updated)
}
