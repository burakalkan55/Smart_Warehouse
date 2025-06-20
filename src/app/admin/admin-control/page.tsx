import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminControlClient from './AdminControlClient'

export default async function AdminControlPage() {
  const user = await getUserFromToken()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
    }
  })

  // Convert Date objects to strings to match the User interface
  const usersWithStringDates = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }))

  return <AdminControlClient currentUser={user} users={usersWithStringDates} />
}
