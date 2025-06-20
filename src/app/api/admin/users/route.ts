import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { name, password, role } = await request.json()

    if (!name || !password) {
      return NextResponse.json({ message: 'Kullanıcı adı ve şifre gereklidir' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { name }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Bu kullanıcı adı zaten mevcut' }, { status: 400 })
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        password,
        role: role || 'USER'
      }
    })

    return NextResponse.json({ 
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: { id: newUser.id, name: newUser.name, role: newUser.role }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}
