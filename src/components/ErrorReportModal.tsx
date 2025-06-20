'use client'

import { useState } from 'react'
import styles from '@/styles/user.module.css'

interface ErrorReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: string) => void
}

export function ErrorReportModal({ isOpen, onClose, onSubmit }: ErrorReportModalProps) {
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSubmit(message.trim())
      setMessage('')
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>⚠️ Hatalı İşlem Bildirimi</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <p>Yaptığınız hatalı işlemi detaylı bir şekilde açıklayın:</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Örnek: 20 ürünü A2 yerine yanlışlıkla A3'e gönderdim. Transfer işlemini geri almak istiyorum..."
              className={styles.textarea}
              required
            />
          </div>
          
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              İptal
            </button>
            <button type="submit" className={styles.submitBtn}>
              📤 Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
