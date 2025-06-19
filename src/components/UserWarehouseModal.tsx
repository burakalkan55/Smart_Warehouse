// Make sure to install react-toastify and its types:
// npm install react-toastify
// npm install --save-dev @types/react-toastify

'use client'

import React, { useState, useEffect } from 'react'
import styles from '@/styles/userWarehouseModal.module.css'
import { toast } from 'react-toastify'

interface Warehouse {
  id: number
  name: string
  floor: number
  capacity: number
  currentStock: number
}

interface UserWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  warehouse: Warehouse | null
  warehouses: Warehouse[]
  onTransfer: (fromId: number, toId: number, amount: number) => void
  onRemove: (warehouseId: number, amount: number) => void
}

export const UserWarehouseModal: React.FC<UserWarehouseModalProps> = ({
  isOpen,
  onClose,
  warehouse,
  warehouses,
  onTransfer,
  onRemove,
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'remove'>('transfer')
  const [transferAmount, setTransferAmount] = useState('')
  const [removeAmount, setRemoveAmount] = useState('')
  const [targetWarehouse, setTargetWarehouse] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTransferAmount('')
      setRemoveAmount('')
      setTargetWarehouse('')
      setActiveTab('transfer')
    }
  }, [isOpen])

  if (!isOpen || !warehouse) return null

  // ✅ Akıllı sıralama + özel adları sona at
  function sortWarehousesSmart(warehouses: Warehouse[]) {
    return warehouses.sort((a, b) => {
      const aMatch = a.name.match(/([a-zA-Z]+)(\d+)/)
      const bMatch = b.name.match(/([a-zA-Z]+)(\d+)/)

      // Sayısal olmayan isimler sona
      if (!aMatch && bMatch) return 1
      if (aMatch && !bMatch) return -1
      if (!aMatch && !bMatch) return a.name.localeCompare(b.name)

      // Only destructure if both matches are not null
      const aPrefix = aMatch ? aMatch[1] : ''
      const aNumber = aMatch ? aMatch[2] : ''
      const bPrefix = bMatch ? bMatch[1] : ''
      const bNumber = bMatch ? bMatch[2] : ''

      if (aPrefix === bPrefix) {
        return Number(aNumber) - Number(bNumber)
      } else {
        return aPrefix.localeCompare(bPrefix)
      }
    })
  }

  const sameFloorWarehouses = sortWarehousesSmart(
    warehouses.filter(w => w.floor === warehouse.floor && w.id !== warehouse.id)
  )

  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val === '' || parseInt(val) <= warehouse.currentStock) {
      setTransferAmount(val)
    }
  }

  const handleRemoveAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val === '' || parseInt(val) <= warehouse.currentStock) {
      setRemoveAmount(val)
    }
  }

  const handleTransfer = () => {
    if (!transferAmount || !targetWarehouse) {
      toast.error('Lütfen transfer miktarı ve hedef depo seçin.')
      return
    }
    const amount = parseInt(transferAmount)
    const toId = parseInt(targetWarehouse)
    const targetWh = warehouses.find(w => w.id === toId)

    if (targetWh && (targetWh.currentStock + amount) > targetWh.capacity) {
      toast.error('Hedef deponun kapasitesi yetersiz!')
      return
    }

    onTransfer(warehouse.id, toId, amount)
    toast.success('Transfer başarıyla yapıldı.')
    onClose()
  }

  const handleRemove = () => {
    if (!removeAmount) {
      toast.error('Lütfen çıkarılacak miktarı girin.')
      return
    }
    const amount = parseInt(removeAmount)
    onRemove(warehouse.id, amount)
    toast.success('Stok başarıyla sistemden çıkartıldı.')
    onClose()
  }

  const percent = warehouse.capacity
    ? Math.floor((warehouse.currentStock / warehouse.capacity) * 100)
    : 0

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeIcon} onClick={onClose}>×</button>
        <h2 className={styles.title}>{warehouse.name} İşlemleri</h2>

        <div className={styles.warehouseInfo}>
          <div className={styles.infoItem}>
            <span>Mevcut Stok:</span>
            <span>{warehouse.currentStock}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Kapasite:</span>
            <span>{warehouse.capacity}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Doluluk:</span>
            <span>%{percent}</span>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'transfer' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            🔄 Transfer
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'remove' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('remove')}
          >
            📤 Çıkart
          </button>
        </div>

        {activeTab === 'transfer' && (
          <div className={styles.tabContent}>
            <div className={styles.inputGroup}>
              <label>Transfer Miktarı:</label>
              <input
                type="text"
                inputMode="numeric"
                value={transferAmount}
                onChange={handleTransferAmountChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Hedef Depo:</label>
              <select
                value={targetWarehouse}
                onChange={(e) => setTargetWarehouse(e.target.value)}
                className={styles.select}
              >
                <option value="">Seçiniz...</option>
                {sameFloorWarehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.currentStock}/{wh.capacity})
                  </option>
                ))}
              </select>
            </div>
            <button className={styles.actionBtn} onClick={handleTransfer}>
              🔄 Transfer Yap
            </button>
          </div>
        )}

        {activeTab === 'remove' && (
          <div className={styles.tabContent}>
            <div className={styles.inputGroup}>
              <label>Çıkarılacak Miktar:</label>
              <input
                type="text"
                inputMode="numeric"
                value={removeAmount}
                onChange={handleRemoveAmountChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            <button className={styles.actionBtn} onClick={handleRemove}>
              📤 Sistemden Çıkart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
