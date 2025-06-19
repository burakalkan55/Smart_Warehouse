'use client'

import styles from '@/styles/user.module.css'
import { useState } from 'react'

interface Warehouse {
  id: number
  name: string
  floor: number
  capacity: number
  currentStock: number
}

const floorNames = {
  0: 'KAT 0',
  '-7': 'KAT -7', 
  '-14': 'KAT -14'
}

export default function UserClient({
  user,
  warehouses,
}: {
  user: any
  warehouses: Warehouse[]
}) {
  const [selectedFloor, setSelectedFloor] = useState<number>(0)

  function sortDepoNamesSmart(depolar: Warehouse[]) {
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

  const floors = [0, -7, -14]
  const selectedWarehouses = sortDepoNamesSmart(
    warehouses.filter(w => w.floor === selectedFloor)
  )

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>Merhaba, {user.name}!</h1>

      <section className={styles.floorSelection}>
        <h2 className={styles.sectionTitle}>🏢 Kat Seçimi</h2>
        <div className={styles.floorButtons}>
          {floors.map(floor => (
            <button
              key={floor}
              className={`${styles.floorBtn} ${
                selectedFloor === floor ? styles.floorBtnActive : ''
              }`}
              onClick={() => setSelectedFloor(floor)}
            >
              {floorNames[floor.toString() as keyof typeof floorNames]}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.warehouseSection}>
       
        <div className={styles.warehouseGrid}>
          {selectedWarehouses.map(warehouse => {
            const percent = warehouse.capacity 
              ? Math.floor((warehouse.currentStock / warehouse.capacity) * 100) 
              : 0
            return (
              <div key={warehouse.id} className={styles.warehouseCard}>
                <div className={styles.warehouseName}>{warehouse.name}</div>
                <div className={styles.warehouseInfo}>
                  {warehouse.currentStock}/{warehouse.capacity}
                </div>
                <div className={styles.warehousePercent}>%{percent}</div>
              </div>
            )
          })}
        </div>
        {selectedWarehouses.length === 0 && (
          <div className={styles.noData}>
            Bu katta henüz depo bulunmuyor.
          </div>
        )}
      </section>

      <div className={styles.footer}>
        <form action="/api/logout" method="GET">
          <button className={styles.logout}>Çıkış Yap</button>
        </form>
      </div>
    </div>
  )
}
