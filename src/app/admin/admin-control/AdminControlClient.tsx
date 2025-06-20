'use client'

import { useState } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface User {
  id: number
  name: string
  role: string
  createdAt: string
}

interface AdminControlClientProps {
  currentUser: any
  users: User[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR')
}

export default function AdminControlClient({ currentUser, users }: AdminControlClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'USER'
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.password.trim()) {
      toast.error('Kullanıcı adı ve şifre gereklidir.')
      return
    }

    try {
      await axios.post('/api/admin/users', formData)
      toast.success('Kullanıcı başarıyla oluşturuldu.', {
        onClose: () => window.location.reload()
      })
      setShowCreateForm(false)
      setFormData({ name: '', password: '', role: 'USER' })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kullanıcı oluşturulamadı.')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !formData.name.trim()) {
      toast.error('Kullanıcı adı gereklidir.')
      return
    }

    try {
      await axios.patch(`/api/admin/users/${editingUser.id}`, {
        name: formData.name,
        role: formData.role,
        ...(formData.password && { password: formData.password })
      })
      toast.success('Kullanıcı başarıyla güncellendi.', {
        onClose: () => window.location.reload()
      })
      setEditingUser(null)
      setFormData({ name: '', password: '', role: 'USER' })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kullanıcı güncellenemedi.')
    }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (userId === currentUser.id) {
      toast.error('Kendi hesabınızı silemezsiniz.')
      return
    }

    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`)
      toast.success('Kullanıcı başarıyla silindi.', {
        onClose: () => window.location.reload()
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kullanıcı silinemedi.')
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      password: '',
      role: user.role
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setShowCreateForm(false)
    setFormData({ name: '', password: '', role: 'USER' })
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
          maxWidth: 1100,
          margin: '32px auto',
          background: '#f7f8fa',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 28, color: '#222', margin: 0 }}>Admin Kullanıcı Yönetimi</h2>
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

          {/* Yeni Kullanıcı Oluştur / Düzenle Formu */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </h3>
              {!showCreateForm && !editingUser && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    background: '#27ae60',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ➕ Yeni Kullanıcı Ekle
                </button>
              )}
            </div>

            {(showCreateForm || editingUser) && (
              <form onSubmit={editingUser ? handleEditUser : handleCreateUser}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Kullanıcı Adı:</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 200 }}
                      placeholder="Kullanıcı adı girin"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Şifre {editingUser && '(Boş bırakırsan değişmez)'}:
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 200 }}
                      placeholder="Şifre girin"
                      required={!editingUser}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Rol:</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 120 }}
                    >
                      <option value="USER">Kullanıcı</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button
                      type="submit"
                      style={{
                        background: '#3498db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginRight: 8
                      }}
                    >
                      💾 {editingUser ? 'Güncelle' : 'Oluştur'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        background: '#95a5a6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Kullanıcı Listesi */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: '#333' }}>Kullanıcı Listesi</h3>
            
            {/* Başlık */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 16,
              padding: '12px 16px',
              background: '#3498db',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 600,
              marginBottom: 8
            }}>
              <div>Kullanıcı Adı</div>
              <div>Rol</div>
              <div>İşlemler</div>
              <div>Oluşturulma</div>
            </div>

            {users.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: '#888'
              }}>
                Henüz kullanıcı bulunmuyor.
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 16,
                  padding: '12px 16px',
                  background: user.id === currentUser.id ? '#e8f5e8' : '#f9f9f9',
                  borderRadius: 8,
                  marginBottom: 8,
                  alignItems: 'center',
                  border: user.id === currentUser.id ? '1px solid #27ae60' : '1px solid #e0e0e0'
                }}>
                  <div style={{ fontWeight: 500, color: '#222' }}>
                    {user.name}
                    {user.id === currentUser.id && (
                      <span style={{ 
                        background: '#27ae60', 
                        color: '#fff', 
                        fontSize: 12, 
                        padding: '2px 6px', 
                        borderRadius: 4, 
                        marginLeft: 8 
                      }}>
                        SİZ
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{
                      background: user.role === 'ADMIN' ? '#e74c3c' : '#3498db',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {user.role === 'ADMIN' ? 'ADMİN' : 'KULLANICI'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => startEdit(user)}
                      style={{
                        background: '#f39c12',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      Düzenle
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
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
                    )}
                  </div>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
