import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export async function POST(req: Request) {
  const { name, password } = await req.json()

  if (!name || !password) {
    return NextResponse.json({ message: 'Eksik bilgi' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { name } })

  if (!user || user.password !== password) {
    return NextResponse.json({ message: 'Geçersiz giriş' }, { status: 401 })
  }

  // ✅ JWT with consistent field names
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60
  })

  return new NextResponse(JSON.stringify({ role: user.role }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json'
    }
  })
}
