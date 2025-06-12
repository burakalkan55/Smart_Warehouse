// client/src/pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, password } = req.body

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { name } })

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Token oluştur
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  // Cookie olarak gönder
  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600
  }))

  res.status(200).json({ role: user.role })
}
