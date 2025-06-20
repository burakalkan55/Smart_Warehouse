import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, userName } = body
    
    // Enhanced validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { message: 'Hata mesajı gerekli ve boş olamaz' },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { message: 'Geçerli kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    if (!userName || typeof userName !== 'string' || !userName.trim()) {
      return NextResponse.json(
        { message: 'Kullanıcı adı gerekli' },
        { status: 400 }
      )
    }

    const errorReport = await prisma.errorReport.create({
      data: {
        message: message.trim(),
        userId,
        userName: userName.trim(),
        createdAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Hata bildirimi başarıyla kaydedildi',
      errorReport 
    })
  } catch (error) {
    console.error('Error creating error report:', error)
    
    // Handle Prisma specific errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Bu hata bildirimi zaten mevcut' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Hata bildirimi kaydedilemedi' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const errorReports = await prisma.errorReport.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(errorReports)
  } catch (error) {
    console.error('Error fetching error reports:', error)
    return NextResponse.json(
      { message: 'Hata raporları getirilemedi' },
      { status: 500 }
    )
  }
}
