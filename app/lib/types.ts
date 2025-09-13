// types for our code review bot
// keeping it simple but comprehensive

export interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  default_branch: string
  language: string | null
  languages_url: string
  contents_url: string
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: "file" | "dir"
  content?: string // base64 encoded
  encoding?: string
}

export interface AnalysisProgress {
  id: string
  status: 'PENDING' | 'FETCHING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'
  progress: number
  currentFile?: string
  totalFiles: number
  processedFiles: number
  message?: string
}

export interface CodeIssue {
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

export interface FileAnalysis {
  filename: string
  language: string
  issues: CodeIssue[]
  totalIssues: number
  criticalIssues: number
  warningIssues: number
  infoIssues: number
}

export interface AnalysisResult {
  id: string
  repository: {
    name: string
    url: string
    description?: string
  }
  status: 'PENDING' | 'FETCHING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'
  progress: number
  startedAt: Date
  completedAt?: Date
  totalFiles: number
  processedFiles: number
  totalIssues: number
  criticalIssues: number
  warningIssues: number
  infoIssues: number
  reports: FileAnalysis[]
}

// supported languages and their file extensions
export const SUPPORTED_LANGUAGES: Record<string, string[]> = {
  python: ['.py', '.pyw'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx'],
  java: ['.java'],
  cpp: ['.cpp', '.cxx', '.cc', '.c++', '.hpp', '.hxx', '.h++', '.c', '.h'],
}

// get language from file extension
export function getLanguageFromExtension(filename: string): string | null {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  
  for (const [lang, extensions] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (extensions.includes(ext)) {
      return lang
    }
  }
  
  return null
}