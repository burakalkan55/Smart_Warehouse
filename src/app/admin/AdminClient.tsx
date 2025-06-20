'use client'

import styles from '@/styles/admin.module.css'
import { WarehouseModal } from '@/components/WarehouseModal'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Warehouse {
  id: number
  name: string
  floor: number
  capacity: number
  currentStock: number
}

export default function AdminClient({
  user,
  warehouses,
}: {
  user: any
  warehouses: Warehouse[]
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addFloor, setAddFloor] = useState(0)

  // Modal açıkken body scrollunu engelle
  useEffect(() => {
    if (selectedWarehouse || addModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedWarehouse, addModalOpen])

  function sortDepoNamesSmart(depolar: Warehouse[]) {
    return depolar.sort((a, b) => {
      // Extract letter prefix and number from warehouse names
      const aMatch = a.name.match(/^([a-zA-Z]+)(\d+)$/)
      const bMatch = b.name.match(/^([a-zA-Z]+)(\d+)$/)
      
      // If either doesn't match the pattern, fall back to string comparison
      if (!aMatch || !bMatch) {
        return a.name.localeCompare(b.name)
      }
      
      const [, aPrefix, aNumStr] = aMatch
      const [, bPrefix, bNumStr] = bMatch
      
      // First compare the letter prefix
      if (aPrefix !== bPrefix) {
        return aPrefix.localeCompare(bPrefix)
      }
      
      // Then compare numbers numerically (not as strings)
      const aNum = parseInt(aNumStr, 10)
      const bNum = parseInt(bNumStr, 10)
      return aNum - bNum
    })
  }

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

  const handleDelete = async () => {
    if (!selectedWarehouse) return
    await axios.delete(`/api/warehouse/${selectedWarehouse.id}`)
    setSelectedWarehouse(null)
    toast.success('Depo başarıyla silindi.', {
      onClose: () => window.location.reload()
    })
  }

  const handleSave = async (data: { capacity: number; currentStock: number }) => {
    if (!selectedWarehouse) return
    await axios.patch(`/api/warehouse/${selectedWarehouse.id}`, data)
    setSelectedWarehouse(null)
    toast.success('Depo bilgileri güncellendi.', {
      onClose: () => window.location.reload()
    })
  }

  // Yeni depo ekleme fonksiyonu (artık modal ile)
  const handleAddWarehouse = (floor: number) => {
    setAddFloor(floor)
    setAddModalOpen(true)
  }

  const handleAddSave = async (data: { name?: string; capacity: number; currentStock: number }) => {
    if (!data.name || data.capacity <= 0) {
      toast.error('Tüm alanları doldurun.')
      return
    }
    if (data.currentStock > data.capacity) {
      toast.error('Güncel ürün miktarı kapasiteden fazla olamaz.')
      return
    }
    try {
      await axios.post('/api/warehouse', {
        name: data.name,
        floor: addFloor,
        capacity: data.capacity,
        currentStock: data.currentStock || 0,
      })
      setAddModalOpen(false)
      toast.success('Depo başarıyla eklendi.', {
        onClose: () => window.location.reload()
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Depo eklenemedi.')
    }
  }

  return (
    <>
      {/* ToastContainer'ı component dışına aldık, sadece burada bırakın, modal veya başka yerde kullanmayın */}
      <ToastContainer position="top-center" autoClose={1000} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.date}>{new Date().toLocaleDateString('tr-TR')}</div>
          <div className={styles.username}>{user?.name}</div>
          <div className={styles.actions}>
            <a href="/admin/admin-control">
              <button className={styles.adminBtn}>Kullanıcı Yönetimi</button>
            </a>
            <a href="/admin/logs">
              <button className={styles.adminBtn}>Log Kayıtları</button>
            </a>
            <a href="/admin/errors">
              <button className={styles.adminBtn}>Hata Bildirimleri</button>
            </a>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h3 style={{ marginBottom: 0 }}>Kat {g.floor} Depoları</h3>
              <button
                className={styles.addWarehouseBtn}
                onClick={() => handleAddWarehouse(g.floor)}
                type="button"
              >
                ➕ Yeni Depo Ekle
              </button>
            </div>
            <div className={styles.grid}>
              {g.list.map(w => {
                const percent = w.capacity ? Math.floor((w.currentStock / w.capacity) * 100) : 0
                return (
                  <div
                    key={w.id}
                    className={styles.cardDepo}
                    onClick={() => setSelectedWarehouse(w)}
                  >
                    {w.name} ({w.currentStock} Adet Ürün)
                    <div className={styles.percent}>%{percent}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <WarehouseModal
          isOpen={!!selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
          onDelete={handleDelete}
          name={selectedWarehouse?.name || ''}
          currentStock={selectedWarehouse?.currentStock || 0}
          capacity={selectedWarehouse?.capacity || 0}
          onSave={handleSave}
          mode="edit"
        />
        <WarehouseModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddSave}
          mode="add"
          floor={addFloor}
        />
      </div>
    </>
  )
}
