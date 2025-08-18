'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  campaignName?: string
}

export function DashboardLayout({ children, campaignName }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar campaignName={campaignName} />
      </div>
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}