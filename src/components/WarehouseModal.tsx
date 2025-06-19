'use client'

import React, { useState, useEffect } from 'react'
import styles from '@/styles/warehouseModal.module.css'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface WarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete?: () => void
  name?: string
  currentStock?: number
  capacity?: number
  onSave?: (data: { name?: string; capacity: number; currentStock: number }) => void
  mode?: 'edit' | 'add'
  floor?: number // hangi katın modalı açıldıysa parenttan gelsin
}

function getFloorLetter(floor: number | undefined) {
  if (floor === 0) return 'A'
  if (floor === -7) return 'B'
  if (floor === -14) return 'C'
  return ''
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  name = '',
  currentStock = 0,
  capacity = 0,
  onSave,
  mode = 'edit',
  floor = 0,
}) => {
  // local state for editable fields
  const [editCapacity, setEditCapacity] = useState(capacity)
  // editStock artık string
  const [editStock, setEditStock] = useState(currentStock === 0 ? '' : String(currentStock))
  const [editNameNum, setEditNameNum] = useState('')

  useEffect(() => {
    if (isOpen) {
      setEditCapacity(capacity)
      // editStock'u string olarak ata
      setEditStock(currentStock === 0 ? '' : String(currentStock))
      if (mode === 'add') {
        setEditNameNum('')
      } else {
        // edit modunda depo adının harf kısmını atla, sadece rakamı al
        const match = name.match(/^[A-Z](\d+)$/i)
        setEditNameNum(match ? match[1] : '')
      }
    }
  }, [isOpen, capacity, currentStock, name, mode])

  if (!isOpen) return null

  const floorLetter = getFloorLetter(floor)

  // Kapasite inputunda 0 silinebilmeli, boşsa 0 olarak setle
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') setEditCapacity(0)
    else setEditCapacity(Number(val))
  }

  // Sadece rakam girilsin
  // const handleNameNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const val = e.target.value.replace(/\D/g, '')
  //   setEditNameNum(val)
  // }
  // Artık her türlü string girilebilir
  const handleNameNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditNameNum(e.target.value)
  }

  // Güncel Ürün inputu değişimi
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '') // sadece rakam
    // baştaki sıfırları kaldır, ama tamamen boş bırakmaya izin ver
    if (val.length > 1) val = val.replace(/^0+/, '')
    setEditStock(val)
  }

  // Depo adı: harf + rakam
  const composedName = `${floorLetter}${editNameNum}`

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal} tabIndex={-1}>
          <button className={styles.closeIcon} onClick={onClose} aria-label="Kapat">×</button>
          <h2 className={styles.title}>
            {mode === 'add' ? 'Yeni Depo Ekle' : `${name} Detayları`}
          </h2>
          <div className={styles.details}>
            {mode === 'add' && (
              <>
                <div>
                  <span className={styles.label}>Depo Adı:</span>
                  <span className={styles.value} style={{ paddingRight: 0, width: 30 }}>{floorLetter}</span>
                  <input
                    type="text"
                    className={styles.value}
                    value={editNameNum}
                    onChange={handleNameNumChange}
                    style={{ width: 80, marginLeft: 0 }}
                    placeholder="1"
                    maxLength={10}
                  />
                </div>
              </>
            )}
            <div>
              <span className={styles.label}>Kapasite:</span>
              <input
                type="number"
                min={0}
                className={styles.value}
                value={editCapacity === 0 ? '' : editCapacity}
                onChange={handleCapacityChange}
                style={{ width: 80 }}
                placeholder="0"
              />
            </div>
            {mode === 'edit' && (
              <div>
                <span className={styles.label}>Güncel Ürün:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  className={styles.value}
                  value={editStock}
                  onChange={handleStockChange}
                  style={{ width: 80 }}
                  placeholder="0"
                />
              </div>
            )}
            <div>
              <span className={styles.label}>Doluluk Oranı:</span>
              <span className={styles.percent}>
                %{editCapacity ? Math.floor(((editStock === '' ? 0 : Number(editStock)) / editCapacity) * 100) : 0}
              </span>
            </div>
          </div>
          <div className={styles.buttons}>
            {mode === 'edit' && onDelete && (
              <button
                className={styles.delete}
                onClick={onDelete}
                style={{ marginRight: 8 }}
              >
                🗑️ Depoyu Sil
              </button>
            )}
            <button
              className={styles.delete}
              style={{ background: '#3498db' }}
              onClick={() => {
                // Alan kontrolleri burada yapılmalı
                if (mode === 'add') {
                  if (!editNameNum.trim() || !editCapacity || editCapacity <= 0) {
                    toast.error('Tüm alanları doldurun.')
                    return
                  }
                  onSave?.({ name: composedName, capacity: editCapacity, currentStock: 0 })
                } else {
                  if (!editCapacity || editCapacity <= 0) {
                    toast.error('Kapasite boş olamaz.')
                    return
                  }
                  // editStock boşsa 0 gönder
                  onSave?.({ capacity: editCapacity, currentStock: editStock === '' ? 0 : Number(editStock) })
                }
              }}
            >
              💾 Kaydet
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

