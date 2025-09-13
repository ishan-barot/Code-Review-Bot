// root layout for the code review bot
// clean and professional design

import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Navigation from '@/components/navigation'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Code Review Bot - Automated Code Analysis",
  description: "Advanced automated code review powered by language models. Find bugs, security issues, and code quality problems across Python, JavaScript, Java, and C++.",
  keywords: "code review, static analysis, bug detection, security analysis, automated testing",
  authors: [{ name: "Code Review Bot Team" }],
  creator: "Code Review Bot",
  publisher: "Code Review Bot",
  robots: "index, follow",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}