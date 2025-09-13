
// main analysis route - starts the whole process and streams progress
// this is where the magic happens lol

export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { getLanguageFromExtension } from '@/lib/types'

interface GitHubFile {
  name: string
  path: string
  size: number
  download_url: string | null
  type: string
}

interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  default_branch: string
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { repoUrl, githubToken } = await request.json()
        
        // basic validation
        if (!repoUrl || !githubToken) {
          const errorData = JSON.stringify({ 
            status: 'error', 
            message: 'repo url and github token are required' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
          return
        }

        // extract owner and repo from url
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!match) {
          const errorData = JSON.stringify({ 
            status: 'error', 
            message: 'invalid github repo url' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
          return
        }

        const [, owner, repoName] = match
        const tokenHash = crypto.createHash('sha256').update(githubToken).digest('hex')

        // send initial progress
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'initializing',
          message: 'starting analysis...',
          progress: 0
        })}\n\n`))

        // get repo info from github
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
          headers: { 'Authorization': `token ${githubToken}` }
        })

        if (!repoResponse.ok) {
          const errorData = JSON.stringify({ 
            status: 'error', 
            message: 'failed to fetch repo info - check token and repo url' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
          return
        }

        const repoData: GitHubRepo = await repoResponse.json()

        // create or update repository record
        const repository = await prisma.repository.upsert({
          where: { url: repoUrl },
          update: {
            name: repoData.full_name,
            description: repoData.description
          },
          create: {
            name: repoData.full_name,
            url: repoUrl,
            description: repoData.description
          }
        })

        // create new analysis session
        const analysis = await prisma.analysis.create({
          data: {
            repositoryId: repository.id,
            tokenHash: tokenHash,
            status: 'FETCHING'
          }
        })

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'fetching',
          message: 'fetching repository files...',
          progress: 10,
          analysisId: analysis.id
        })}\n\n`))

        // fetch all files from repo
        const files = await fetchAllFiles(owner, repoName, githubToken)
        
        // filter for supported files only
        const supportedFiles = files.filter(file => {
          const lang = getLanguageFromExtension(file.name)
          return lang && file.type === 'file' && file.size < 1024 * 1024 // max 1mb per file
        })

        if (supportedFiles.length === 0) {
          await prisma.analysis.update({
            where: { id: analysis.id },
            data: { status: 'FAILED' }
          })
          
          const errorData = JSON.stringify({ 
            status: 'error', 
            message: 'no supported files found in repository' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
          return
        }

        // update analysis with file count
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            totalFiles: supportedFiles.length,
            status: 'ANALYZING'
          }
        })

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'analyzing',
          message: `found ${supportedFiles.length} files to analyze`,
          progress: 20,
          totalFiles: supportedFiles.length
        })}\n\n`))

        // analyze each file
        let processedCount = 0
        let totalIssues = 0
        let criticalCount = 0
        let warningCount = 0
        let infoCount = 0

        for (const file of supportedFiles) {
          try {
            // get file content
            const contentResponse = await fetch(file.download_url!, {
              headers: { 'Authorization': `token ${githubToken}` }
            })
            const content = await contentResponse.text()
            const language = getLanguageFromExtension(file.name)!

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              status: 'analyzing',
              message: `analyzing ${file.path}`,
              progress: 20 + (processedCount / supportedFiles.length) * 70,
              currentFile: file.path
            })}\n\n`))

            // analyze with llm
            const issues = await analyzeFileWithLLM(content, language, file.path)
            
            // count issues by severity
            const fileCritical = issues.filter((i: any) => i.severity === 'CRITICAL').length
            const fileWarning = issues.filter((i: any) => i.severity === 'WARNING').length
            const fileInfo = issues.filter((i: any) => i.severity === 'INFO').length
            
            criticalCount += fileCritical
            warningCount += fileWarning
            infoCount += fileInfo
            totalIssues += issues.length

            // save report to db
            const report = await prisma.report.create({
              data: {
                analysisId: analysis.id,
                filename: file.path,
                language: language,
                fileSize: file.size,
                content: content
              }
            })

            // save issues
            for (const issue of issues) {
              await prisma.issue.create({
                data: {
                  reportId: report.id,
                  type: issue.type,
                  severity: issue.severity,
                  title: issue.title,
                  description: issue.description,
                  suggestion: issue.suggestion,
                  lineNumber: issue.lineNumber,
                  columnStart: issue.columnStart,
                  columnEnd: issue.columnEnd,
                  codeSnippet: issue.codeSnippet
                }
              })
            }

            processedCount++
            
            // update progress
            await prisma.analysis.update({
              where: { id: analysis.id },
              data: { processedFiles: processedCount }
            })

          } catch (error) {
            console.error(`error analyzing ${file.path}:`, error)
            // continue with next file
          }
        }

        // complete analysis
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            totalIssues: totalIssues,
            criticalIssues: criticalCount,
            warningIssues: warningCount,
            infoIssues: infoCount,
            progress: 100
          }
        })

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'completed',
          message: 'analysis completed!',
          progress: 100,
          analysisId: analysis.id,
          totalIssues: totalIssues,
          criticalIssues: criticalCount,
          warningIssues: warningCount,
          infoIssues: infoCount
        })}\n\n`))

        controller.close()

      } catch (error) {
        console.error('analysis error:', error)
        const errorData = JSON.stringify({ 
          status: 'error', 
          message: 'analysis failed' 
        })
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// recursively fetch all files from github repo
async function fetchAllFiles(owner: string, repo: string, token: string, path: string = ''): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const response = await fetch(url, {
    headers: { 'Authorization': `token ${token}` }
  })
  
  if (!response.ok) {
    throw new Error(`failed to fetch files from ${path}`)
  }
  
  const data = await response.json()
  const files: GitHubFile[] = []
  
  for (const item of data) {
    if (item.type === 'file') {
      files.push(item)
    } else if (item.type === 'dir') {
      // recursively fetch directory contents
      const subFiles = await fetchAllFiles(owner, repo, token, item.path)
      files.push(...subFiles)
    }
  }
  
  return files
}

// analyze single file with llm
async function analyzeFileWithLLM(content: string, language: string, filename: string) {
  const prompt = `analyze this ${language} code file for potential issues. look for:
1. bugs and logic errors
2. security vulnerabilities
3. code smells and bad practices
4. style issues
5. performance problems
6. maintainability issues

file: ${filename}
code:
\`\`\`${language}
${content}
\`\`\`

respond with a json array of issues found. for each issue provide:
- type: one of BUG, SECURITY, CODE_SMELL, STYLE, PERFORMANCE, MAINTAINABILITY
- severity: one of CRITICAL, WARNING, INFO  
- title: short descriptive title
- description: detailed explanation of the issue
- suggestion: how to fix it (optional)
- lineNumber: line number where issue occurs (optional)
- codeSnippet: the problematic code (optional)

example:
[
  {
    "type": "BUG",
    "severity": "CRITICAL", 
    "title": "potential null pointer dereference",
    "description": "variable could be null when accessed",
    "suggestion": "add null check before access",
    "lineNumber": 42,
    "codeSnippet": "obj.method()"
  }
]

respond with valid json only, no markdown or other text.`

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      console.error('llm api error:', response.status)
      return []
    }

    const result = await response.json()
    const analysisText = result.choices?.[0]?.message?.content || '{"issues": []}'
    
    // try to parse json response
    try {
      const parsed = JSON.parse(analysisText)
      return Array.isArray(parsed) ? parsed : (parsed.issues || [])
    } catch (e) {
      console.error('failed to parse llm response:', analysisText)
      return []
    }
  } catch (error) {
    console.error('llm analysis failed:', error)
    return []
  }
}
