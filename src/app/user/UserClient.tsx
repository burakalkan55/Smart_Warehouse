'use client'

import styles from '@/styles/user.module.css'
import { UserWarehouseModal } from '@/components/UserWarehouseModal'
import { useState, useEffect } from 'react'
import axios from 'axios'

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
  warehouses: initialWarehouses,
}: {
  user: any
  warehouses: Warehouse[]
}) {
  const [selectedFloor, setSelectedFloor] = useState<number>(0)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)

  // Modal açıkken body scrollunu engelle
  useEffect(() => {
    if (selectedWarehouse) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedWarehouse])

  function sortDepoNamesSmart(depolar: Warehouse[]) {
    return depolar.sort((a, b) => {
      // Handle special cases first
      if (a.name.includes('Blokaj') && !b.name.includes('Blokaj')) return 1
      if (!a.name.includes('Blokaj') && b.name.includes('Blokaj')) return -1
      
      // Extract letter prefix and number from warehouse names
      const aMatch = a.name.match(/^([a-zA-Z]+)(\d+)$/)
      const bMatch = b.name.match(/^([a-zA-Z]+)(\d+)$/)
      
      // If both match the pattern (like A3, A4, etc.)
      if (aMatch && bMatch) {
        const [, aPrefix, aNumStr] = aMatch
        const [, bPrefix, bNumStr] = bMatch
        
        // First compare the letter prefix
        if (aPrefix !== bPrefix) {
          return aPrefix.localeCompare(bPrefix)
        }
        
        // Then compare numbers numerically
        const aNum = parseInt(aNumStr, 10)
        const bNum = parseInt(bNumStr, 10)
        return aNum - bNum
      }
      
      // If one matches pattern and other doesn't, prioritize the patterned one
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      
      // Fall back to string comparison for non-standard names
      return a.name.localeCompare(b.name, 'tr', { numeric: true })
    })
  }

  const floors = [0, -7, -14]
  const selectedWarehouses = sortDepoNamesSmart(
    warehouses.filter(w => w.floor === selectedFloor)
  )

  const handleTransfer = async (fromId: number, toId: number, amount: number) => {
    try {
      const response = await axios.post('/api/warehouse/transfer', {
        fromId,
        toId,
        amount
      })
      alert(response.data.message)
      setSelectedWarehouse(null)
      // Depoları güncelle (manuel olarak stokları güncelle)
      setWarehouses(prev =>
        prev.map(w =>
          w.id === fromId
            ? { ...w, currentStock: w.currentStock - amount }
            : w.id === toId
            ? { ...w, currentStock: w.currentStock + amount }
            : w
        )
      )
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Transfer başarısız')
    }
  }

  const handleRemove = async (warehouseId: number, amount: number) => {
    try {
      const response = await axios.post('/api/warehouse/remove', {
        warehouseId,
        amount
      })
      alert(response.data.message)
      setSelectedWarehouse(null)
      // Depoyu güncelle (stok azalt)
      setWarehouses(prev =>
        prev.map(w =>
          w.id === warehouseId
            ? { ...w, currentStock: w.currentStock - amount }
            : w
        )
      )
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Çıkarma işlemi başarısız')
    }
  }

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
              <div 
                key={warehouse.id} 
                className={styles.warehouseCard}
                onClick={() => setSelectedWarehouse(warehouse)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.warehouseName}>{warehouse.name}</div>
                
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

      <UserWarehouseModal
        isOpen={!!selectedWarehouse}
        onClose={() => setSelectedWarehouse(null)}
        warehouse={selectedWarehouse}
        warehouses={warehouses}
        onTransfer={handleTransfer}
        onRemove={handleRemove}
      />
    </div>
  )
}
