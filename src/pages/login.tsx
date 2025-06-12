'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      router.push(data.role === 'ADMIN' ? '/admin' : '/user')
    } catch (err) {
      setError('Bir hata oluştu.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Giriş Yap</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>Kullanıcı Adı</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Kullanıcı adınızı girin"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className={styles.label}>Şifre</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>Giriş Yap</button>
        </form>
      </div>
    </div>
  )
}
