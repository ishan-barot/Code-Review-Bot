
// history page - shows all past analyses with pagination
// server side rendered but with client side interactions

import AnalysisHistory from '@/components/analysis-history'

interface PageProps {
  searchParams: { page?: string }
}

async function getAnalyses(page: number = 1) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/history?page=${page}&limit=10`, {
      cache: 'no-store' // fresh data each time
    })
    
    if (!response.ok) {
      throw new Error('failed to fetch analyses')
    }
    
    return response.json()
  } catch (error) {
    console.error('failed to fetch analysis history:', error)
    return { analyses: [], pagination: { page: 1, total: 0, pages: 0 } }
  }
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const data = await getAnalyses(page)
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Analysis History</h1>
          <p className="text-slate-600">view all your past code reviews and their results</p>
        </div>
        
        <AnalysisHistory 
          analyses={data.analyses}
          pagination={data.pagination}
          currentPage={page}
        />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Analysis History - Code Review Bot',
  description: 'View all your past code analysis results'
}
