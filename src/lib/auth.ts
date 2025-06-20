import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: number
  name: string
  role: 'ADMIN' | 'USER'
  iat: number
  exp: number
}

export async function getUserFromToken(): Promise<TokenPayload | null> {
  const token = (await cookies()).get('token')?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}


// (değişiklik yok, sadece TransferLog için userId kullanımı önemli)
