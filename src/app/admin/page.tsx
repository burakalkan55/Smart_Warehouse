import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getUserFromToken()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }
  const warehouses = await prisma.warehouse.findMany()
  return <AdminClient user={user} warehouses={warehouses} />
}
