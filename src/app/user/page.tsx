import { getUserFromToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from '@/styles/user.module.css'

export default async function UserPage() {
  const user = await getUserFromToken()
  console.log('user:', user) // Debug: check what is returned

  if (!user || user.role !== 'USER') {
    redirect('/login')
  }

  return (
    <main className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>📦 Kullanıcı Paneli</h1>
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
    </main>
  )
}
