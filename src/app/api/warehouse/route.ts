import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, floor, capacity, currentStock } = await req.json()
  if (!name || typeof floor !== 'number' || !capacity) {
    return NextResponse.json({ message: 'Eksik bilgi' }, { status: 400 })
  }
  
  const stockValue = currentStock || 0
  if (stockValue > capacity) {
    return NextResponse.json({ message: 'Güncel ürün miktarı kapasiteden fazla olamaz.' }, { status: 400 })
  }
  
  // Aynı isimde depo var mı kontrol et
  const exists = await prisma.warehouse.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ message: 'Bu isimde bir depo zaten var.' }, { status: 409 })
  }
  const warehouse = await prisma.warehouse.create({
    data: { name, floor, capacity, currentStock: stockValue }
  })
  return NextResponse.json(warehouse)
}
