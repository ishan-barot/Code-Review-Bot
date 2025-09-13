
// database seeding script
// creates some sample data for testing

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('seeding database...')
  
  // create sample repository
  const repo = await prisma.repository.upsert({
    where: { url: 'https://github.com/sample/test-repo' },
    update: {},
    create: {
      name: 'sample/test-repo',
      url: 'https://github.com/sample/test-repo',
      description: 'sample repository for testing code review bot'
    }
  })

  // create completed analysis
  const analysis = await prisma.analysis.upsert({
    where: { id: 'sample-analysis-1' },
    update: {},
    create: {
      id: 'sample-analysis-1',
      repositoryId: repo.id,
      status: 'COMPLETED',
      progress: 100,
      totalFiles: 3,
      processedFiles: 3,
      totalIssues: 5,
      criticalIssues: 2,
      warningIssues: 2,
      infoIssues: 1,
      completedAt: new Date(),
      tokenHash: 'sample-hash'
    }
  })

  // create sample report
  const report = await prisma.report.create({
    data: {
      analysisId: analysis.id,
      filename: 'src/main.py',
      language: 'python',
      fileSize: 1024,
      content: `# sample python file with issues
def process_data(data):
    if data == None:  # bad comparison
        return []
    
    results = []
    for item in data:
        results.append(item * 2)  # potential performance issue
    
    return results

# unused variable
unused_var = "not used anywhere"

def insecure_function(user_input):
    # security issue - sql injection vulnerability
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    return query
`
    }
  })

  // create sample issues
  const issues = [
    {
      reportId: report.id,
      type: 'BUG' as const,
      severity: 'CRITICAL' as const,
      title: 'comparison with none using == instead of is',
      description: 'using == to compare with none can lead to unexpected behavior',
      suggestion: 'use "is none" instead of "== none"',
      lineNumber: 3,
      codeSnippet: 'if data == None:',
    },
    {
      reportId: report.id,
      type: 'SECURITY' as const,
      severity: 'CRITICAL' as const, 
      title: 'sql injection vulnerability',
      description: 'direct string concatenation in sql query allows injection attacks',
      suggestion: 'use parameterized queries or orm methods',
      lineNumber: 14,
      codeSnippet: 'query = "SELECT * FROM users WHERE name = \'" + user_input + "\'"',
    },
    {
      reportId: report.id,
      type: 'PERFORMANCE' as const,
      severity: 'WARNING' as const,
      title: 'inefficient list building',
      description: 'repeatedly calling append on list can be slow for large datasets',
      suggestion: 'consider using list comprehension: [item * 2 for item in data]',
      lineNumber: 7,
      codeSnippet: 'results.append(item * 2)',
    },
    {
      reportId: report.id,
      type: 'CODE_SMELL' as const, 
      severity: 'WARNING' as const,
      title: 'unused variable',
      description: 'variable is defined but never used',
      suggestion: 'remove unused variable or use it appropriately',
      lineNumber: 12,
      codeSnippet: 'unused_var = "not used anywhere"',
    },
    {
      reportId: report.id,
      type: 'STYLE' as const,
      severity: 'INFO' as const,
      title: 'function missing docstring',
      description: 'functions should have docstrings explaining their purpose',
      suggestion: 'add docstring describing what the function does',
      lineNumber: 2,
      codeSnippet: 'def process_data(data):',
    }
  ]

  for (const issue of issues) {
    await prisma.issue.create({ data: issue })
  }

  console.log('seeding completed!')
  console.log(`created repository: ${repo.name}`)
  console.log(`created analysis with ${issues.length} issues`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
