import './globals.css'

export const metadata = {
  title: 'GCA Dijital Depo',
  description: 'GCA Dijital Depo Yönetim Sistemi',
  icons: {
    icon: '/favicon.ico',
  },
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
