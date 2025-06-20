import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ErrorReportsClient from './ErrorReportsClient'

export default async function ErrorReportsPage() {
  const user = await getUserFromToken()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const errorReports = await prisma.errorReport.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Convert Date objects to strings
  const errorReportsWithStringDates = errorReports.map(report => ({
    ...report,
    createdAt: report.createdAt.toISOString()
  }))

  return <ErrorReportsClient errorReports={errorReportsWithStringDates} />
}
