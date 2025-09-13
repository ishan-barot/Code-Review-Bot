
'use client'

// paginated history of all analyses
// includes search and filtering

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Bug,
  Shield,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface Props {
  analyses: AnalysisHistory[]
  pagination: Pagination
  currentPage: number
}

export default function AnalysisHistory({ analyses, pagination, currentPage }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.repository.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (analysis.repository.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const goToPage = (page: number) => {
    router.push(`/history?page=${page}`)
  }

  return (
    <div className="space-y-6">
      {/* search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              export csv
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* results */}
      {filteredAnalyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'no analyses match your search' : 'no analyses found'}
            </p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      {analysis.repository.name}
                      <a 
                        href={analysis.repository.url} 
                        target="_blank" 
                        className="text-sm text-slate-500 hover:text-slate-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
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
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <span>{analysis.processedFiles}/{analysis.totalFiles} files</span>
                    
                    {analysis.status === 'COMPLETED' && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Bug className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">{analysis.criticalIssues}</span>
                          <span className="text-slate-500">critical</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600">{analysis.warningIssues}</span>
                          <span className="text-slate-500">warnings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600">{analysis.infoIssues}</span>
                          <span className="text-slate-500">info</span>
                        </div>
                      </div>
                    )}
                    
                    {analysis.status === 'FAILED' && (
                      <span className="text-red-600 text-sm">analysis failed</span>
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

      {/* pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let page: number
                    if (pagination.pages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= pagination.pages - 2) {
                      page = pagination.pages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                >
                  next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
