import './globals.css'

export const metadata = {
  title: 'GCA Dijital Depo',
  description: 'GCA Dijital Depo Yönetim Sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
