
# Code Review Bot

Automated code analysis powered by advanced language models to catch bugs, security issues, and improve code quality across multiple programming languages.

## Features

- **Multi-language Support**: Python, JavaScript, TypeScript, Java, and C++
- **Comprehensive Analysis**: Detects bugs, security vulnerabilities, code smells, style issues, performance problems, and maintainability concerns
- **Real-time Streaming**: Live progress updates during analysis
- **Detailed Reports**: Line-by-line suggestions with explanations and severity ratings
- **Analysis History**: Track and compare results over time
- **GitHub Integration**: Works with both public and private repositories using personal access tokens
- **Responsive Design**: Clean, modern interface that works on all devices

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub personal access token with repository permissions

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd code_review_bot/app
   yarn install
   ```

2. **Database Setup**
   ```bash
   # the database url is already configured in .env
   yarn prisma generate
   yarn prisma db push
   ```

3. **Start Development Server**
   ```bash
   yarn dev
   ```

4. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Usage

1. **Get GitHub Token**
   - go to github.com → settings → developer settings → personal access tokens
   - create new token with `repo` permissions
   - copy the token (starts with `ghp_`)

2. **Analyze Repository**
   - paste github repo url (e.g., `https://github.com/owner/repo`)
   - enter your github token
   - click "start analysis"
   - watch real-time progress updates

3. **View Results**
   - detailed report shows issues by file and severity
   - each issue includes description, location, and fix suggestions
   - filter by severity level or browse by file

## Supported Languages

| Language   | Extensions                              |
|------------|----------------------------------------|
| Python     | `.py`, `.pyw`                          |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs`          |
| TypeScript | `.ts`, `.tsx`                          |
| Java       | `.java`                                |
| C++        | `.cpp`, `.cxx`, `.cc`, `.c++`, `.hpp`, `.hxx`, `.h++`, `.c`, `.h` |

## Issue Types

- **Bug**: Logic errors and potential crashes
- **Security**: Vulnerabilities and security anti-patterns  
- **Code Smell**: Bad practices affecting maintainability
- **Style**: Formatting and naming conventions
- **Performance**: Inefficient code patterns
- **Maintainability**: Complex or hard-to-maintain code

## Severity Levels

- **Critical**: Must fix - causes crashes or major security issues
- **Warning**: Should fix - impacts code quality or minor security concerns
- **Info**: Consider fixing - style or minor improvements

## API Endpoints

### Start Analysis
```bash
POST /api/analyze
{
  "repoUrl": "https://github.com/owner/repo",
  "githubToken": "ghp_xxxxxxxxxxxx"
}
# returns streaming response with progress updates
```

### Get Analysis Results
```bash
GET /api/analysis/{id}
# returns complete analysis with all issues and details
```

### Get Analysis History
```bash
GET /api/history?page=1&limit=10
# returns paginated list of past analyses
```

## Environment Variables

The following variables are automatically configured:

```env
# database connection
DATABASE_URL=postgresql://...

# llm api for code analysis
ABACUSAI_API_KEY=...

# app url for api calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Development

### Project Structure
```
app/
├── app/                    # next.js app router
│   ├── api/               # api routes
│   │   ├── analyze/       # main analysis endpoint
│   │   ├── analysis/      # get results by id
│   │   └── history/       # analysis history
│   ├── analysis/[id]/     # analysis results page
│   ├── history/           # history page
│   └── page.tsx          # main dashboard
├── components/            # react components
├── lib/                   # utilities and types
├── prisma/               # database schema
└── public/               # static files
```

### Database Schema

- **Repository**: stores repo metadata
- **Analysis**: tracks analysis sessions with progress
- **Report**: file-level analysis results  
- **Issue**: individual code issues with details

### Adding New Languages

1. update `SUPPORTED_LANGUAGES` in `lib/types.ts`
2. modify llm prompt in analysis route to handle new syntax
3. test with sample repositories

## Troubleshooting

### Common Issues

**Analysis fails with "failed to fetch repo info"**
- check github token permissions
- verify repository url format
- ensure token has access to private repos if needed

**No supported files found**
- repository may not contain supported languages
- check file extensions match supported list
- files over 1mb are skipped

**Analysis timeout**
- large repositories may take longer
- refresh page to check if analysis completed
- contact support for repositories with 1000+ files

**Database connection errors**
- database url is automatically configured
- check prisma schema is synced: `yarn prisma db push`

### Rate Limits

- github api: 5000 requests/hour with token
- llm api: sufficient for most use cases
- large repos may need multiple analysis sessions

## Security

- github tokens are hashed before storage, never stored in plain text
- analysis data is stored securely in postgresql
- all api endpoints validate input parameters
- no sensitive data exposed in frontend

## Contributing

we welcome contributions! areas for improvement:

- support for more programming languages
- advanced analysis rules and patterns
- integration with ci/cd pipelines
- performance optimizations
- ui/ux enhancements

## License

this project is built for educational and professional use. please respect github's terms of service when using their api.

## Support

for issues or questions:
- check this readme for common solutions
- review github token permissions
- verify repository access and file types
- ensure stable internet connection during analysis

---

*built with nextjs, typescript, tailwindcss, and prisma. powered by advanced language models for intelligent code analysis.*
