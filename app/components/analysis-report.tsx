
'use client'

// detailed analysis report component
// shows issues grouped by file with syntax highlighting

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Share2,
  Bug,
  Shield,
  Code2,
  Zap,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

interface Issue {
  id: string
  type: 'BUG' | 'SECURITY' | 'CODE_SMELL' | 'STYLE' | 'PERFORMANCE' | 'MAINTAINABILITY'
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  description: string
  suggestion?: string
  lineNumber?: number
  columnStart?: number
  columnEnd?: number
  codeSnippet?: string
}

interface Report {
  id: string
  filename: string
  language: string
  fileSize: number
  issues: Issue[]
}

interface Analysis {
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
  reports: Report[]
}

interface Props {
  analysis: Analysis
}

export default function AnalysisReport({ analysis }: Props) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-4 h-4" />
      case 'SECURITY':
        return <Shield className="w-4 h-4" />
      case 'STYLE':
        return <Code2 className="w-4 h-4" />
      case 'PERFORMANCE':
        return <Zap className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Code Review - ${analysis.repository.name}`,
          text: `Found ${analysis.totalIssues} issues in ${analysis.repository.name}`,
          url: window.location.href
        })
      } catch (error) {
        // fallback to copying url
        navigator.clipboard?.writeText(window.location.href)
      }
    } else {
      // fallback to copying url
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  const filteredReports = analysis.reports.map(report => ({
    ...report,
    issues: report.issues.filter(issue => 
      selectedSeverity === 'all' || issue.severity === selectedSeverity
    )
  })).filter(report => report.issues.length > 0)

  const selectedReport = selectedFile 
    ? analysis.reports.find(r => r.filename === selectedFile)
    : null

  return (
    <div className="container mx-auto px-6 py-12">
      {/* header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              back to dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shareReport}>
              <Share2 className="w-4 h-4 mr-2" />
              share
            </Button>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Code2 className="w-8 h-8 text-blue-600" />
          {analysis.repository.name}
        </h1>
        
        {analysis.repository.description && (
          <p className="text-slate-600 mb-4">{analysis.repository.description}</p>
        )}

        <div className="flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(analysis.startedAt), 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {analysis.completedAt && formatDistanceToNow(new Date(analysis.completedAt), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {analysis.processedFiles} files analyzed
          </div>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Bug className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.criticalIssues}</p>
                <p className="text-sm text-slate-600">critical issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.warningIssues}</p>
                <p className="text-sm text-slate-600">warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.infoIssues}</p>
                <p className="text-sm text-slate-600">info</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.totalIssues}</p>
                <p className="text-sm text-slate-600">total issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* main content */}
      <Tabs value={selectedFile || 'overview'} onValueChange={setSelectedFile}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="overview">overview</TabsTrigger>
            <TabsTrigger value="files">files</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">filter by severity:</span>
            <select 
              value={selectedSeverity} 
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">all</option>
              <option value="CRITICAL">critical</option>
              <option value="WARNING">warning</option>
              <option value="INFO">info</option>
            </select>
          </div>
        </div>

        <TabsContent value="overview">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">no issues found</h3>
                <p className="text-slate-600">great job! your code looks clean</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {report.filename}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {report.language}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.issues.map((issue) => (
                        <div key={issue.id} className="border-l-4 border-slate-200 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1">
                              {getIssueIcon(issue.type)}
                              <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toLowerCase()}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">{issue.title}</h4>
                              <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                              
                              {issue.lineNumber && (
                                <p className="text-xs text-slate-500 mb-2">
                                  line {issue.lineNumber}
                                </p>
                              )}
                              
                              {issue.codeSnippet && (
                                <pre className="text-xs bg-slate-50 p-2 rounded border overflow-x-auto mb-2">
                                  <code>{issue.codeSnippet}</code>
                                </pre>
                              )}
                              
                              {issue.suggestion && (
                                <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                                  <p className="text-blue-800">
                                    <strong>suggestion:</strong> {issue.suggestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* file list */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">files ({filteredReports.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {filteredReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedFile(report.filename)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 ${
                          selectedFile === report.filename ? 'bg-blue-50 border-r-2 border-r-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{report.filename}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {report.issues.length}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* file details */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {selectedReport.filename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReport.issues.filter(issue => 
                        selectedSeverity === 'all' || issue.severity === selectedSeverity
                      ).map((issue) => (
                        <div key={issue.id} className="border-l-4 border-slate-200 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1">
                              {getIssueIcon(issue.type)}
                              <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toLowerCase()}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">{issue.title}</h4>
                              <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                              
                              {issue.lineNumber && (
                                <p className="text-xs text-slate-500 mb-2">
                                  line {issue.lineNumber}
                                </p>
                              )}
                              
                              {issue.codeSnippet && (
                                <pre className="text-xs bg-slate-50 p-2 rounded border overflow-x-auto mb-2">
                                  <code>{issue.codeSnippet}</code>
                                </pre>
                              )}
                              
                              {issue.suggestion && (
                                <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                                  <p className="text-blue-800">
                                    <strong>suggestion:</strong> {issue.suggestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">select a file to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
