'use client'
import './globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation' // ✅ doğru import!

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login') // ✅ yönlendirme
  }, [router])

  return null
}
