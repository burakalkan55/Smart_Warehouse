'use client'

import styles from '@/styles/user.module.css'
import { UserWarehouseModal } from '@/components/UserWarehouseModal'
import { ErrorReportModal } from '@/components/ErrorReportModal'
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

// TransferLog tipi
interface TransferLog {
  id: number
  from: Warehouse
  to: Warehouse
  amount: number
  createdAt: string
}

const floorNames = {
  0: 'KAT 0',
  '-7': 'KAT -7', 
  '-14': 'KAT -14'
}

export default function UserClient({
  user,
  warehouses: initialWarehouses,
  transferLogs = [],
}: {
  user: any
  warehouses: Warehouse[]
  transferLogs?: TransferLog[]
}) {
  const [selectedFloor, setSelectedFloor] = useState<number>(0)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)
  const [errorReportOpen, setErrorReportOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Modal açıkken body scrollunu engelle
  useEffect(() => {
    if (selectedWarehouse || errorReportOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedWarehouse, errorReportOpen])

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

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
      setWarehouses(prev =>
        prev.map(w =>
          w.id === fromId
            ? { ...w, currentStock: w.currentStock - amount }
            : w.id === toId
            ? { ...w, currentStock: w.currentStock + amount }
            : w
        )
      )
      toast.success(response.data.message || 'Transfer başarıyla yapıldı.', {
        onClose: () => setSelectedWarehouse(null)
      })
    } catch (error: any) {
      if (error?.message === 'Network Error') {
        toast.error('Ağ bağlantısı yok. Lütfen internetinizi kontrol edin.')
      } else {
        toast.error(error?.response?.data?.message || 'Transfer başarısız')
      }
    }
  }

  const handleRemove = async (warehouseId: number, amount: number) => {
    try {
      const response = await axios.post('/api/warehouse/remove', {
        warehouseId,
        amount
      })
      setWarehouses(prev =>
        prev.map(w =>
          w.id === warehouseId
            ? { ...w, currentStock: w.currentStock - amount }
            : w
        )
      )
      toast.success(response.data.message || 'Stok başarıyla sistemden çıkartıldı.', {
        onClose: () => setSelectedWarehouse(null)
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Çıkarma işlemi başarısız')
    }
  }

  const handleErrorReport = async (message: string) => {
    try {
      // Simplified validation - user is already authenticated
      if (!message.trim()) {
        toast.error('Hata mesajı boş olamaz.')
        return
      }

      const response = await axios.post('/api/error-report', {
        message: message.trim(),
        userId: user.id, // Use user.id instead of user.userId
        userName: user.name
      })
      
      setErrorReportOpen(false)
      toast.success('Hata bildirimi başarıyla gönderildi.')
    } catch (error: any) {
      console.error('Error report submission failed:', error)
      if (error?.response?.status === 400) {
        toast.error(error.response.data?.message || 'Geçersiz veri gönderildi.')
      } else if (error?.message === 'Network Error') {
        toast.error('Ağ bağlantısı yok. Lütfen internetinizi kontrol edin.')
      } else {
        toast.error(error?.response?.data?.message || 'Hata bildirimi gönderilemedi.')
      }
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error)
      toast.error('Tam ekran özelliği desteklenmiyor.')
    }
  }

  return (
    <>
      {/* ToastContainer'ı sadece burada bırakın, modal veya başka yerde kullanmayın */}
      <ToastContainer position="top-center" autoClose={1000} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Merhaba, {user.name}!</h1>
          <button
            className={styles.fullscreenBtn}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran yap'}
          >
            {isFullscreen ? '🗙' : '⛶'}
          </button>
        </div>

        <section className={styles.floorSelection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>🏢 Kat Seçimi</h2>
            <button
              className={styles.errorReportBtn}
              onClick={() => setErrorReportOpen(true)}
            >
              ⚠️ Hatalı İşlem Bildirimi
            </button>
          </div>
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

        <ErrorReportModal
          isOpen={errorReportOpen}
          onClose={() => setErrorReportOpen(false)}
          onSubmit={handleErrorReport}
        />
      </div>
    </>
  )
}




