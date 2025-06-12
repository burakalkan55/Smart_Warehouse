'use client'

import React, { useState, useEffect } from 'react'
import styles from '@/styles/warehouseModal.module.css'

interface WarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  name: string
  currentStock: number
  capacity: number
  onSave?: (data: { capacity: number; currentStock: number }) => void
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  name,
  currentStock,
  capacity,
  onSave,
}) => {
  // local state for editable fields
  const [editCapacity, setEditCapacity] = useState(capacity)
  const [editStock, setEditStock] = useState(currentStock)

  useEffect(() => {
    if (isOpen) {
      setEditCapacity(capacity)
      setEditStock(currentStock)
    }
  }, [isOpen, capacity, currentStock])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} tabIndex={-1}>
        <button className={styles.closeIcon} onClick={onClose} aria-label="Kapat">×</button>
        <h2 className={styles.title}>{name} Detayları</h2>
        <div className={styles.details}>
          <div>
            <span className={styles.label}>Kapasite:</span>
            <input
              type="number"
              min={0}
              className={styles.value}
              value={editCapacity}
              onChange={e => setEditCapacity(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </div>
          <div>
            <span className={styles.label}>Güncel Ürün:</span>
            <input
              type="number"
              min={0}
              className={styles.value}
              value={editStock}
              onChange={e => setEditStock(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </div>
          <div>
            <span className={styles.label}>Doluluk Oranı:</span>
            <span className={styles.percent}>
              %{editCapacity ? Math.floor((editStock / editCapacity) * 100) : 0}
            </span>
          </div>
        </div>
        <div className={styles.buttons}>
          <button
            className={styles.delete}
            onClick={onDelete}
            style={{ marginRight: 8 }}
          >
            🗑️ Depoyu Sil
          </button>
          <button
            className={styles.delete}
            style={{ background: '#3498db' }}
            onClick={() => onSave?.({ capacity: editCapacity, currentStock: editStock })}
          >
            💾 Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
