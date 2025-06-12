import { getUserFromToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from '@/styles/admin.module.css'

export default async function AdminPage() {
  const user = await getUserFromToken()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>📦 Admin Paneli</h1>
          <p className={styles.userInfo}>
            👤 Giriş yapan kullanıcı: <strong>{user.name}</strong> 
          </p>
          <form action="/api/logout" method="GET">
            <button type="submit" className={styles.logout}>
              Çıkış Yap
            </button>
          </form>
        </header>
        <section className={styles.content}>
          <h2>📍 Depo Verisi</h2>
          <p>Buraya kullanıcıya özel veri giriş bölümü gelecek...</p>
        </section>
      </div>
    </div>
  )
}
