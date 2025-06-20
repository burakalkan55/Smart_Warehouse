'use client'

import { useState } from 'react'
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

interface ErrorReportsClientProps {
  errorReports: ErrorReport[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR')
}

export default function ErrorReportsClient({ errorReports }: ErrorReportsClientProps) {
  const [reports, setReports] = useState(errorReports)

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Bu hata bildirimini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await axios.delete(`/api/error-report/${reportId}`)
      setReports(reports.filter(report => report.id !== reportId))
      toast.success('Hata bildirimi silindi')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Hata bildirimi silinemedi')
    }
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div style={{
        background: '#393e54',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '32px auto',
          background: '#f7f8fa',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 28, color: '#222', margin: 0 }}>Hata Bildirimleri</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/admin" style={{
                background: '#3498db',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none'
              }}>Geri Dön</a>
              <form action="/api/logout" method="GET">
                <button style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}>Çıkış Yap</button>
              </form>
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e0e0e0'
          }}>
            {reports.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: '#888'
              }}>
                Henüz hata bildirimi bulunmuyor.
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 16,
                  padding: '12px 16px',
                  background: '#e74c3c',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  <div>Hata Mesajı</div>
                  <div>Kullanıcı</div>
                  <div>Tarih</div>
                  <div>İşlemler</div>
                </div>

                {reports.map(report => (
                  <div key={report.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    gap: 16,
                    padding: '12px 16px',
                    background: '#f9f9f9',
                    borderRadius: 8,
                    marginBottom: 8,
                    alignItems: 'center',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      fontWeight: 500, 
                      color: '#222',
                      wordBreak: 'break-word'
                    }}>
                      {report.message}
                    </div>
                    <div style={{ color: '#666' }}>
                      {report.userName}
                    </div>
                    <div style={{ color: '#666', fontSize: 14 }}>
                      {formatDate(report.createdAt)}
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        style={{
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
