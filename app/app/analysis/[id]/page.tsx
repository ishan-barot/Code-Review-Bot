
// analysis results page - shows detailed report
// dynamic route to display analysis by id

import { notFound } from 'next/navigation'
import AnalysisReport from '@/components/analysis-report'

interface PageProps {
  params: { id: string }
}

async function getAnalysis(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analysis/${id}`, {
      cache: 'no-store' // always get fresh data
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('failed to fetch analysis:', error)
    return null
  }
}

export default async function AnalysisPage({ params }: PageProps) {
  const analysis = await getAnalysis(params.id)
  
  if (!analysis) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <AnalysisReport analysis={analysis} />
    </div>
  )
}

// generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const analysis = await getAnalysis(params.id)
  
  return {
    title: analysis ? `Code Review - ${analysis.repository.name}` : 'Analysis Not Found',
    description: analysis 
      ? `Code review results for ${analysis.repository.name} - ${analysis.totalIssues} issues found`
      : 'The requested analysis could not be found'
  }
}
