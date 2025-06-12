// src/app/admin/page.tsx
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import styles from '@/styles/admin.module.css'

function sortDepoNamesSmart(depolar: any[]) {
  return depolar.sort((a, b) => {
    const aMatch = a.name.match(/([a-zA-Z]+)(\d+)/)
    const bMatch = b.name.match(/([a-zA-Z]+)(\d+)/)

    if (!aMatch || !bMatch) return a.name.localeCompare(b.name)

    const [, aPrefix, aNum] = aMatch
    const [, bPrefix, bNum] = bMatch

    if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix)
    return parseInt(aNum) - parseInt(bNum)
  })
}

export default async function AdminPanelPage() {
  const user = await getUserFromToken()
  if (!user || user.role !== 'ADMIN') return null

  const warehouses = await prisma.warehouse.findMany()
  const floors = [0, -7, -14]

  const grouped = floors.map(floor => {
    const list = sortDepoNamesSmart(warehouses.filter(w => w.floor === floor))
    const total = list.reduce((a, w) => a + w.capacity, 0)
    const stock = list.reduce((a, w) => a + w.currentStock, 0)
    const percent = total ? Math.floor((stock / total) * 100) : 0
    return { floor, list, total, stock, percent }
  })

  const totalCapacity = warehouses.reduce((a, w) => a + w.capacity, 0)
  const totalStock = warehouses.reduce((a, w) => a + w.currentStock, 0)
  const totalPercent = totalCapacity ? Math.floor((totalStock / totalCapacity) * 100) : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.date}>{new Date().toLocaleDateString('tr-TR')}</div>
        <div className={styles.username}>{user.name}</div>
        <div className={styles.actions}>
          <button className={styles.adminBtn}>Admin Kontrol</button>
          <form action="/api/logout" method="GET">
            <button className={styles.logoutBtn}>Çıkış Yap</button>
          </form>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.card}>
          <h4>Genel Doluluk Oranı</h4>
          <p>{totalStock}/{totalCapacity}</p>
          <strong>%{totalPercent}</strong>
        </div>
        {grouped.map(g => (
          <div key={g.floor} className={styles.card}>
            <h4>Kat {g.floor} Doluluk Oranı</h4>
            <p>{g.stock}/{g.total}</p>
            <strong>%{g.percent}</strong>
          </div>
        ))}
      </div>

      {grouped.map(g => (
        <div key={g.floor} className={styles.floorSection}>
          <h3>Kat {g.floor} Depoları</h3>
          <div className={styles.grid}>
            {g.list.map(w => {
              const percent = w.capacity ? Math.floor((w.currentStock / w.capacity) * 100) : 0
              return (
                <div key={w.id} className={styles.cardDepo}>
                  {w.name} ({w.currentStock} Adet Ürün)
                  <div className={styles.percent}>%{percent}</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
