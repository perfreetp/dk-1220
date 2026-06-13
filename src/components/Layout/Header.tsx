import { useLocation } from 'react-router-dom'
import { Search, Download, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useServiceStore } from '@/stores/serviceStore'
import clsx from 'clsx'

const pageTitles: Record<string, string> = {
  '/': '拓扑总览',
  '/topology': '拓扑总览',
  '/service/new': '服务录入',
  '/link-query': '链路查询',
  '/change-records': '变更记录',
  '/alerts': '告警面板'
}

interface HeaderProps {
  onExport?: () => void
  onRefresh?: () => void
  onAddService?: () => void
}

export function Header({ onExport, onRefresh, onAddService }: HeaderProps) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || '服务拓扑观察台'
  const setSearchQuery = useServiceStore((state) => state.setSearchQuery)
  const [localSearch, setLocalSearch] = useState('')
  
  const handleSearch = (value: string) => {
    setLocalSearch(value)
    setSearchQuery(value)
  }

  const showSearch = location.pathname === '/topology' || location.pathname === '/'
  const showActions = location.pathname === '/topology' || location.pathname === '/'

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#1E3A5F] z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 
          className="text-xl font-semibold text-white"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索服务..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className={clsx(
                'w-48 px-4 py-2 pl-10 rounded-lg bg-[#1E3A5F] border border-[#1E3A5F]',
                'text-white text-sm placeholder-gray-400',
                'focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/30',
                'transition-all duration-200'
              )}
            />
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2">
            {onAddService && (
              <button
                onClick={onAddService}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
                  'hover:bg-[#00D9FF]/20 hover:border-[#00D9FF]/50',
                  'transition-all duration-200 text-sm font-medium'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>新增服务</span>
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={clsx(
                  'p-2 rounded-lg',
                  'bg-[#1E3A5F] text-gray-400 border border-[#1E3A5F]',
                  'hover:text-white hover:border-[#00D9FF]/30',
                  'transition-all duration-200'
                )}
                title="刷新数据"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-[#1E3A5F] text-gray-400 border border-[#1E3A5F]',
                  'hover:text-white hover:border-[#00D9FF]/30',
                  'transition-all duration-200 text-sm'
                )}
              >
                <Download className="w-4 h-4" />
                <span>导出快照</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}