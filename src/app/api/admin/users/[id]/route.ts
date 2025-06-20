import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    const { name, password, role } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'Kullanıcı adı gereklidir' }, { status: 400 })
    }

    // Check if name is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        name,
        NOT: { id: userId }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Bu kullanıcı adı zaten mevcut' }, { status: 400 })
    }

    const updateData: any = {
      name,
      role: role || 'USER'
    }

    if (password) {
      updateData.password = password
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({ 
      message: 'Kullanıcı başarıyla güncellendi',
      user: { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role }
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 })
    }

    const userId = parseInt(params.id)

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ message: 'Kendi hesabınızı silemezsiniz' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Kullanıcı silinemedi' },
      { status: 500 }
    )
  }
}
