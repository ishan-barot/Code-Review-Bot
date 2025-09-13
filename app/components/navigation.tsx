
'use client'

// main navigation header
// sticky nav with logo and main links

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Code2, 
  Menu, 
  X, 
  History, 
  Home, 
  Github,
  ExternalLink 
} from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'dashboard', icon: Home },
    { href: '/history', label: 'history', icon: History },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Code Review Bot
            </span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={isActive(href) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200" />
            
            <a 
              href="https://github.com/features/issues" 
              target="_blank"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* mobile nav */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive(href) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                </Link>
              ))}
              
              <div className="h-px bg-slate-200 my-2" />
              
              <a 
                href="https://github.com/features/issues" 
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Github className="w-4 h-4" />
                docs
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
