
// get analysis results by id
// simple get route to fetch completed analysis

export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        repository: true,
        reports: {
          include: {
            issues: true
          }
        }
      }
    })

    if (!analysis) {
      return Response.json({ error: 'analysis not found' }, { status: 404 })
    }

    // format response
    const result = {
      id: analysis.id,
      repository: {
        name: analysis.repository.name,
        url: analysis.repository.url,
        description: analysis.repository.description
      },
      status: analysis.status,
      progress: analysis.progress,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      totalFiles: analysis.totalFiles,
      processedFiles: analysis.processedFiles,
      totalIssues: analysis.totalIssues,
      criticalIssues: analysis.criticalIssues,
      warningIssues: analysis.warningIssues,
      infoIssues: analysis.infoIssues,
      reports: analysis.reports.map(report => ({
        id: report.id,
        filename: report.filename,
        language: report.language,
        fileSize: report.fileSize,
        issues: report.issues.map(issue => ({
          id: issue.id,
          type: issue.type,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          suggestion: issue.suggestion,
          lineNumber: issue.lineNumber,
          columnStart: issue.columnStart,
          columnEnd: issue.columnEnd,
          codeSnippet: issue.codeSnippet
        }))
      }))
    }

    return Response.json(result)

  } catch (error) {
    console.error('failed to fetch analysis:', error)
    return Response.json({ error: 'failed to fetch analysis' }, { status: 500 })
  }
}
