import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function GET() {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  })

  const res = NextResponse.redirect(
  new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || process.env.LOCALWORK)
)

  res.headers.set('Set-Cookie', cookie)
  return res
}
