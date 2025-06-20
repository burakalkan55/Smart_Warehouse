import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UserClient from './UserClient'
import styles from '@/styles/user.module.css'

export default async function UserPage() {
  const user = await getUserFromToken()
  console.log('user:', user) // Debug: check what is returned

  if (!user || user.role !== 'USER') {
    redirect('/login')
  }

  const warehouses = await prisma.warehouse.findMany()

  // Kullanıcının transfer loglarını çek
  const transferLogsRaw = await prisma.transferLog.findMany({
    where: { userId: user.id }, // Changed from user.userId to user.id
    orderBy: { createdAt: 'desc' },
    include: {
      from: true,
      to: true
    }
  })

  // Convert all Date fields to string for client compatibility
  const transferLogs = transferLogsRaw.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
    from: {
      ...log.from,
      createdAt: log.from.createdAt.toISOString(),
    },
    to: {
      ...log.to,
      createdAt: log.to.createdAt.toISOString(),
    }
  }))

  return (
    <div className={styles.wrapper}>
    
      <div className={styles.card}>
           
       
        <section className={styles.content}>
         
          <UserClient user={user} warehouses={warehouses} transferLogs={transferLogs} />
        </section>
      </div>
    </div>
  )
}

