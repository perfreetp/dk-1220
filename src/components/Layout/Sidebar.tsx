import { NavLink, useLocation } from 'react-router-dom'
import { 
  Network, 
  Server, 
  Search, 
  History, 
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAlertStore } from '@/stores/alertStore'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { path: '/topology', label: '拓扑总览', icon: Network },
  { path: '/service/new', label: '服务录入', icon: Server },
  { path: '/link-query', label: '链路查询', icon: Search },
  { path: '/change-records', label: '变更记录', icon: History },
  { path: '/alerts', label: '告警面板', icon: Bell }
]

export function Sidebar() {
  const location = useLocation()
  const unresolvedCount = useAlertStore((state) => state.getUnresolvedCount())
  const criticalCount = useAlertStore((state) => state.getCriticalCount())
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside 
      className={clsx(
        'fixed left-0 top-0 h-full bg-[#0A1628] border-r border-[#1E3A5F] transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className={clsx(
          'flex items-center px-4 h-16 border-b border-[#1E3A5F]',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-[#00D9FF]" />
              <span className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Topology
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[#1E3A5F] transition-colors text-[#00D9FF]"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/topology' && location.pathname === '/')
              const Icon = item.icon
              const showBadge = item.path === '/alerts' && criticalCount > 0
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      collapsed ? 'justify-center' : '',
                      isActive 
                        ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30' 
                        : 'text-gray-400 hover:text-white hover:bg-[#1E3A5F]'
                    )}
                  >
                    <Icon className={clsx(
                      'w-5 h-5 transition-transform',
                      isActive ? 'text-[#00D9FF]' : 'group-hover:scale-110'
                    )} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {showBadge && !collapsed && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-[#EF4444] text-white rounded-full animate-pulse">
                        {criticalCount}
                      </span>
                    )}
                    {showBadge && collapsed && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-[#EF4444] text-white rounded-full animate-pulse">
                        {criticalCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="px-4 py-4 border-t border-[#1E3A5F]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>系统运行中</span>
            </div>
            {unresolvedCount > 0 && (
              <div className="mt-2 text-xs text-[#F59E0B]">
                {unresolvedCount} 个未处理告警
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}