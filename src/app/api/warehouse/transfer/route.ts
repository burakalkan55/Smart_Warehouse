import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { fromId, toId, amount } = await req.json()
    
    if (!fromId || !toId || !amount || amount <= 0) {
      return NextResponse.json({ message: 'Geçersiz veri' }, { status: 400 })
    }

    // Transaction kullanarak güvenli transfer
    const result = await prisma.$transaction(async (tx) => {
      // Kaynak depoyu kontrol et
      const fromWarehouse = await tx.warehouse.findUnique({
        where: { id: fromId }
      })
      
      if (!fromWarehouse || fromWarehouse.currentStock < amount) {
        throw new Error('Yetersiz stok')
      }

      // Hedef depoyu kontrol et
      const toWarehouse = await tx.warehouse.findUnique({
        where: { id: toId }
      })
      
      if (!toWarehouse || (toWarehouse.currentStock + amount) > toWarehouse.capacity) {
        throw new Error('Hedef depo kapasitesi yetersiz')
      }

      // Transfer işlemi
      await tx.warehouse.update({
        where: { id: fromId },
        data: { currentStock: fromWarehouse.currentStock - amount }
      })

      await tx.warehouse.update({
        where: { id: toId },
        data: { currentStock: toWarehouse.currentStock + amount }
      })

      return { fromWarehouse, toWarehouse }
    })

    return NextResponse.json({ 
      message: `${amount} adet ürün ${result.fromWarehouse.name}'den ${result.toWarehouse.name}'e transfer edildi` 
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
