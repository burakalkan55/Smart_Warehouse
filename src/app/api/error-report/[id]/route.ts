import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 })
    }

    const errorReportId = parseInt(params.id)
    if (isNaN(errorReportId)) {
      return NextResponse.json({ message: 'Geçersiz ID' }, { status: 400 })
    }

    await prisma.errorReport.delete({
      where: { id: errorReportId }
    })

    return NextResponse.json({ message: 'Hata bildirimi silindi' })
  } catch (error) {
    console.error('Error deleting error report:', error)
    return NextResponse.json(
      { message: 'Hata bildirimi silinemedi' },
      { status: 500 }
    )
  }
}
