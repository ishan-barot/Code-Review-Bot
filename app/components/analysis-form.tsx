
'use client'

// form for inputting github repo and starting analysis
// streams progress updates in real time

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Github, Play, AlertCircle, CheckCircle2, Clock, FileSearch } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AnalysisProgress {
  status: string
  message?: string
  progress: number
  analysisId?: string
  totalFiles?: number
  currentFile?: string
  totalIssues?: number
  criticalIssues?: number
  warningIssues?: number
  infoIssues?: number
}

export default function AnalysisForm() {
  const [repoUrl, setRepoUrl] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const startAnalysis = async () => {
    if (!repoUrl || !githubToken) {
      setError('please enter both repo url and github token')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setProgress({ status: 'initializing', progress: 0, totalFiles: 0 })

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, githubToken })
      })

      if (!response.body) {
        throw new Error('no response body')
      }

      // stream the response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed: AnalysisProgress = JSON.parse(data)
              setProgress(parsed)
              
              if (parsed.status === 'error') {
                setError(parsed.message || 'analysis failed')
                setIsAnalyzing(false)
                return
              }
              
              if (parsed.status === 'completed' && parsed.analysisId) {
                // wait a sec then redirect to results
                setTimeout(() => {
                  router.push(`/analysis/${parsed.analysisId}`)
                }, 2000)
              }
            } catch (e) {
              // skip invalid json
            }
          }
        }
      }

    } catch (err) {
      setError('analysis failed - check your connection')
      console.error('analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = () => {
    if (!progress) return null
    
    switch (progress.status) {
      case 'initializing':
      case 'fetching':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case 'analyzing':
        return <FileSearch className="w-5 h-5 text-yellow-600 animate-pulse" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="repo-url" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub Repository URL
          </Label>
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isAnalyzing}
          />
          <p className="text-xs text-slate-500">public or private repos supported</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            GitHub Personal Access Token
          </Label>
          <Input
            id="token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isAnalyzing}
          />
          <p className="text-xs text-slate-500">
            need repo access permissions -{' '}
            <a 
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              how to create
            </a>
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {progress && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">
                {progress.status === 'initializing' && 'initializing analysis...'}
                {progress.status === 'fetching' && 'fetching repository files...'}
                {progress.status === 'analyzing' && 'analyzing code...'}
                {progress.status === 'completed' && 'analysis completed!'}
              </p>
              {progress.message && (
                <p className="text-sm text-slate-600">{progress.message}</p>
              )}
              {progress.currentFile && (
                <p className="text-sm text-slate-600">currently: {progress.currentFile}</p>
              )}
            </div>
          </div>
          
          <Progress value={progress.progress} className="w-full" />
          
          {progress.status === 'completed' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">found issues:</span>
              <span className="text-red-600 font-medium">{progress.criticalIssues || 0} critical</span>
              <span className="text-yellow-600 font-medium">{progress.warningIssues || 0} warnings</span>
              <span className="text-blue-600 font-medium">{progress.infoIssues || 0} info</span>
            </div>
          )}
        </div>
      )}

      <Button 
        onClick={startAnalysis} 
        disabled={isAnalyzing || !repoUrl || !githubToken}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <Play className="w-4 h-4 mr-2" />
        {isAnalyzing ? 'analyzing...' : 'start analysis'}
      </Button>
    </div>
  )
}
