import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function GET() {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // ❌ Token'ı yok eder
  })

  return new NextResponse(JSON.stringify({ message: 'Logged out' }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  })
}
