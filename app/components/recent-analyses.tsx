
'use client'

// shows recent analysis history
// loads from api and updates every few seconds

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FileText,
  Bug,
  Shield,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface AnalysisHistory {
  id: string
  repository: {
    name: string
    url: string
    description?: string
  }
  status: string
  progress: number
  startedAt: string
  completedAt?: string
  totalFiles: number
  processedFiles: number
  totalIssues: number
  criticalIssues: number
  warningIssues: number
  infoIssues: number
}

export default function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
    // refresh every 30 seconds to catch in-progress analyses
    const interval = setInterval(loadAnalyses, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAnalyses = async () => {
    try {
      const response = await fetch('/api/history?limit=6')
      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error) {
      console.error('failed to load analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive">failed</Badge>
      case 'ANALYZING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">analyzing {progress}%</Badge>
      case 'FETCHING':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">fetching</Badge>
      default:
        return <Badge variant="outline">pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'ANALYZING':
      case 'FETCHING':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Analyses</h2>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Analyses</h2>
        {analyses.length > 0 && (
          <Link href="/history">
            <Button variant="outline" size="sm">
              view all
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">no analyses yet</p>
            <p className="text-sm text-gray-500 mt-1">start your first code review above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      {analysis.repository.name}
                    </CardTitle>
                    {analysis.repository.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {analysis.repository.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(analysis.status, analysis.progress)}
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(analysis.startedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{analysis.processedFiles}/{analysis.totalFiles} files</span>
                    {analysis.status === 'COMPLETED' && analysis.totalIssues > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <Bug className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">{analysis.criticalIssues}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600">{analysis.warningIssues}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600">{analysis.infoIssues}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {analysis.status === 'COMPLETED' && (
                    <Link href={`/analysis/${analysis.id}`}>
                      <Button variant="outline" size="sm">
                        view report
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
