// main landing page - where users input repo url and token
// keeping it clean and simple

import AnalysisForm from '@/components/analysis-form'
import RecentAnalyses from '@/components/recent-analyses'
import { Code2, Zap, Shield, Bug } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* hero section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Code Review Bot
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Automated code analysis powered by advanced language models to catch bugs, security issues, and improve code quality
          </p>
        </div>

        {/* features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-4 bg-red-50 rounded-xl mb-4">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bug Detection</h3>
            <p className="text-slate-600">finds logic errors and potential crashes before they hit production</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-4 bg-yellow-50 rounded-xl mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Security Analysis</h3>
            <p className="text-slate-600">detects vulnerabilities and security anti-patterns across multiple languages</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-4 bg-green-50 rounded-xl mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Code Quality</h3>
            <p className="text-slate-600">improves maintainability with style and performance suggestions</p>
          </div>
        </div>

        {/* analysis form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Start New Analysis</h2>
            <AnalysisForm />
          </div>
        </div>

        {/* recent analyses */}
        <div className="max-w-6xl mx-auto">
          <RecentAnalyses />
        </div>
      </div>
    </div>
  )
}