import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const user = await getUserFromToken()
  const warehouses = await prisma.warehouse.findMany()
  return <AdminClient user={user} warehouses={warehouses} />
}
