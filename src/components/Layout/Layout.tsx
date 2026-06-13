import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useState } from 'react'

interface LayoutProps {
  onExport?: () => void
  onRefresh?: () => void
  onAddService?: () => void
}

export function Layout({ onExport, onRefresh, onAddService }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Sidebar />
      <Header onExport={onExport} onRefresh={onRefresh} onAddService={onAddService} />
      <main className={`pt-16 pb-8 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="px-6 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}