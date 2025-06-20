'use client'

import { useState } from 'react'
import styles from '@/styles/admin.module.css'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ErrorReport {
  id: number
  message: string
  userId: number
  userName: string
  createdAt: string
}

export default function ErrorsClient({
  user,
  errorReports: initialErrorReports,
}: {
  user: any
  errorReports: ErrorReport[]
}) {
  const [errorReports, setErrorReports] = useState<ErrorReport[]>(initialErrorReports)

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/error-report/${id}`)
      setErrorReports(prev => prev.filter(report => report.id !== id))
      toast.success('Hata bildirimi silindi.')
    } catch (error) {
      toast.error('Hata bildirimi silinemedi.')
    }
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={1000} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.date}>{new Date().toLocaleDateString('tr-TR')}</div>
          <div className={styles.username}>{user?.name}</div>
          <div className={styles.actions}>
            <a href="/admin">
              <button className={styles.adminBtn}>Ana Sayfa</button>
            </a>
            <a href="/admin/admin-control">
              <button className={styles.adminBtn}>Kullanıcı Yönetimi</button>
            </a>
            <a href="/admin/logs">
              <button className={styles.adminBtn}>Log Kayıtları</button>
            </a>
            <form action="/api/logout" method="GET">
              <button className={styles.logoutBtn}>Çıkış Yap</button>
            </form>
          </div>
        </div>

        <div className={styles.pageTitle}>
          <h2>⚠️ Hata Bildirimleri</h2>
          <p>Kullanıcılar tarafından bildirilen hatalı işlemler</p>
        </div>

        {errorReports.length === 0 ? (
          <div className={styles.noData}>
            Henüz hata bildirimi bulunmuyor.
          </div>
        ) : (
          <div className={styles.errorReportsList}>
            {errorReports.map(report => (
              <div key={report.id} className={styles.errorReportCard}>
                <div className={styles.errorReportHeader}>
                  <div className={styles.errorReportUser}>
                    <strong>{report.userName}</strong>
                    <span className={styles.errorReportDate}>
                      {new Date(report.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(report.id)}
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
                <div className={styles.errorReportMessage}>
                  {report.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
