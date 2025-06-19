import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { warehouseId, amount } = await req.json()
    
    if (!warehouseId || !amount || amount <= 0) {
      return NextResponse.json({ message: 'Geçersiz veri' }, { status: 400 })
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    })
    
    if (!warehouse || warehouse.currentStock < amount) {
      return NextResponse.json({ message: 'Yetersiz stok' }, { status: 400 })
    }

    const updated = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { currentStock: warehouse.currentStock - amount }
    })

    return NextResponse.json({ 
      message: `${amount} adet ürün ${warehouse.name}'den sistemden çıkarıldı` 
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
