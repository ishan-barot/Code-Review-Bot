
// get analysis history - all past analyses
// paginated for performance

export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          repository: true
        }
      }),
      prisma.analysis.count()
    ])

    const result = {
      analyses: analyses.map(analysis => ({
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
        infoIssues: analysis.infoIssues
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    return Response.json(result)

  } catch (error) {
    console.error('failed to fetch history:', error)
    return Response.json({ error: 'failed to fetch history' }, { status: 500 })
  }
}
