import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from '@/styles/user.module.css'
import { cookies } from 'next/headers'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR')
}

function toCSV(rows: any[], columns: string[]) {
  const header = columns.join(',')
  const body = rows.map(row => columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
  return header + '\n' + body
}

export default async function AdminLogsPage({ searchParams }: { searchParams?: any }) {
  const user = await getUserFromToken()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  // Filtreler
  const page = Number(searchParams?.page || 1)
  const pageSize = 10
  const userId = searchParams?.userId ? Number(searchParams.userId) : undefined
  const fromId = searchParams?.fromId ? Number(searchParams.fromId) : undefined
  const toId = searchParams?.toId ? Number(searchParams.toId) : undefined
  const dateStr = searchParams?.date || ''
  const date = dateStr ? new Date(dateStr) : undefined

  // Kullanıcılar ve depoları çek
  const [users, warehouses] = await Promise.all([
    prisma.user.findMany({ where: { role: 'USER' }, orderBy: { name: 'asc' } }),
    prisma.warehouse.findMany({ orderBy: { name: 'asc' } }),
  ])

  // Filtreli logları çek
  const where: any = {}
  if (userId) where.userId = userId
  if (fromId) where.fromId = fromId
  if (toId) where.toId = toId
  if (date) {
    // Sadece o günün logları
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    where.createdAt = { gte: date, lt: nextDay }
  }

  const totalCount = await prisma.transferLog.count({ where })
  const logs = await prisma.transferLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: true, from: true, to: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  // CSV export
  const isCSV = searchParams?.csv === '1'
  if (isCSV) {
    const allLogs = await prisma.transferLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true, from: true, to: true },
    })
    const csv = toCSV(
      allLogs.map(l => ({
        Kullanıcı: l.user?.name,
        'Kaynak Depo': l.from?.name,
        'Hedef Depo': l.to?.name,
        Adet: l.amount,
        Tarih: formatDate(l.createdAt.toISOString()),
      })),
      ['Kullanıcı', 'Kaynak Depo', 'Hedef Depo', 'Adet', 'Tarih']
    )
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transfer-logs.csv"',
      },
    })
  }

  // Filtre sıfırlama için query string olmadan yönlendir
  function clearFiltersUrl() {
    return '/admin/logs'
  }

  // Sayfalama
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, color: '#222', margin: 0 }}>Log Kayıtları</h2>
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
        {/* Filtreler */}
        <form method="GET" style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 16,
          background: '#fff',
          borderRadius: 8,
          padding: 12,
        }}>
          <select name="userId" defaultValue={userId || ''} style={{ padding: 8, borderRadius: 6 }}>
            <option value="">Tüm Kullanıcılar</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select name="fromId" defaultValue={fromId || ''} style={{ padding: 8, borderRadius: 6 }}>
            <option value="">Tüm Kaynak Depolar</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select name="toId" defaultValue={toId || ''} style={{ padding: 8, borderRadius: 6 }}>
            <option value="">Tüm Hedef Depolar</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <span style={{ fontWeight: 500, color: '#555' }}>Tarih Seçimi:</span>
          <input
            type="date"
            name="date"
            defaultValue={dateStr}
            style={{ padding: 8, borderRadius: 6 }}
          />
          <button type="submit" style={{
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer'
          }}>Filtrele</button>
          <a href={clearFiltersUrl()} style={{
            background: '#888',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none'
          }}>Filtreleri Temizle</a>
          <a
            href={`/admin/logs?${
              new URLSearchParams(
                Object.fromEntries(
                  Object.entries(searchParams || {}).filter(
                    ([, v]) => typeof v === 'string' || typeof v === 'number'
                  ).map(([k, v]) => [k, String(v)])
                ) as Record<string, string>
              ).toString() + (Object.keys(searchParams || {}).length ? '&' : '') + 'csv=1'
            }`}
            style={{
              background: '#27ae60',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none'
            }}
          >Dışa Aktar (CSV)</a>
        </form>
        {/* Loglar */}
        <div style={{ marginTop: 8 }}>
          {logs.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              color: '#888',
              textAlign: 'center'
            }}>
              Kayıt bulunamadı.
            </div>
          ) : (
            <div>
              {logs.map(log => (
                <div key={log.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: '12px 18px',
                  border: '1px solid #e0e0e0',
                  fontSize: 16,
                }}>
                  <div>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log.user?.name}</span>
                    {', '}
                    <span style={{ color: '#2980b9' }}>{log.from?.name}</span>
                    {' deposundan '}
                    <span style={{ color: '#27ae60' }}>{log.to?.name}</span>
                    {' deposuna '}
                    <span style={{ fontWeight: 600 }}>{log.amount}</span>
                    {' adet gönderdi'}
                  </div>
                  <div style={{ color: '#888', fontSize: 14 }}>
                    {formatDate(log.createdAt.toISOString())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sayfalama */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 18 }}>
          <form method="GET">
            <input type="hidden" name="page" value={page - 1} />
            {Object.entries(searchParams || {}).map(([k, v]) =>
              k !== 'page' ? <input key={k} type="hidden" name={k} value={v as string} /> : null
            )}
            <button type="submit" disabled={page <= 1} style={{
              background: '#eee',
              color: '#888',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontWeight: 500,
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}>Önceki</button>
          </form>
          {Array.from({ length: totalPages }, (_, i) => (
            <form key={i + 1} method="GET">
              <input type="hidden" name="page" value={i + 1} />
              {Object.entries(searchParams || {}).map(([k, v]) =>
                k !== 'page' ? <input key={k} type="hidden" name={k} value={v as string} /> : null
              )}
              <button
                type="submit"
                style={{
                  background: page === i + 1 ? '#3498db' : '#eee',
                  color: page === i + 1 ? '#fff' : '#888',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: 2,
                  marginLeft: 2,
                }}
                disabled={page === i + 1}
              >{i + 1}</button>
            </form>
          ))}
          <form method="GET">
            <input type="hidden" name="page" value={page + 1} />
            {Object.entries(searchParams || {}).map(([k, v]) =>
              k !== 'page' ? <input key={k} type="hidden" name={k} value={v as string} /> : null
            )}
            <button type="submit" disabled={page >= totalPages} style={{
              background: '#eee',
              color: '#888',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontWeight: 500,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}>Sonraki</button>
          </form>
        </div>
      </div>
    </div>
  )
}
