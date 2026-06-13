import { useServiceStore } from '@/stores/serviceStore'
import { getDomains } from '@/services/mockDataService'
import { Filter, X } from 'lucide-react'
import clsx from 'clsx'

export function FilterPanel() {
  const services = useServiceStore((state) => state.services)
  const filterDomain = useServiceStore((state) => state.filterDomain)
  const filterEnv = useServiceStore((state) => state.filterEnv)
  const setFilterDomain = useServiceStore((state) => state.setFilterDomain)
  const setFilterEnv = useServiceStore((state) => state.setFilterEnv)

  const domains = getDomains(services)
  const environments = ['development', 'testing', 'staging', 'production']
  const envLabels: Record<string, string> = {
    development: '开发环境',
    testing: '测试环境',
    staging: '预发环境',
    production: '生产环境'
  }

  const hasFilters = filterDomain || filterEnv

  const clearFilters = () => {
    setFilterDomain(null)
    setFilterEnv(null)
  }

  return (
    <div className="w-64 bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00D9FF]" />
          <span className="text-sm font-medium text-white">筛选条件</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="p-1 rounded hover:bg-[#2E4A6F] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-2 block">业务域</label>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setFilterDomain(filterDomain === domain ? null : domain)}
                className={clsx(
                  'px-2 py-1 rounded-lg text-xs transition-all duration-200',
                  filterDomain === domain
                    ? 'bg-[#00D9FF] text-[#0A1628] font-medium'
                    : 'bg-[#2E4A6F] text-gray-400 hover:text-white hover:bg-[#3E5A7F]'
                )}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-2 block">环境</label>
          <div className="flex flex-wrap gap-2">
            {environments.map((env) => (
              <button
                key={env}
                onClick={() => setFilterEnv(filterEnv === env ? null : env as any)}
                className={clsx(
                  'px-2 py-1 rounded-lg text-xs transition-all duration-200',
                  filterEnv === env
                    ? 'bg-[#00D9FF] text-[#0A1628] font-medium'
                    : 'bg-[#2E4A6F] text-gray-400 hover:text-white hover:bg-[#3E5A7F]'
                )}
              >
                {envLabels[env]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 pt-4 border-t border-[#2E4A6F]">
          <div className="text-xs text-gray-400">
            已筛选: {useServiceStore.getState().getFilteredServices().length} 个服务
          </div>
        </div>
      )}
    </div>
  )
}