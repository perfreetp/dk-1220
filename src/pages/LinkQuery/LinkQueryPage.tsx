import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { 
  Search, 
  AlertTriangle, 
  ArrowRight,
  Server,
  Code,
  ChevronRight
} from 'lucide-react'
import { ServiceInterface, Service, ALERT_LEVEL_COLORS } from '@/types'
import clsx from 'clsx'

export function LinkQueryPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const interfaces = useServiceStore((state) => state.interfaces)
  const relations = useServiceStore((state) => state.relations)
  const alerts = useAlertStore((state) => state.alerts)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'interface' | 'service'>('interface')

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()

    if (searchType === 'interface') {
      return interfaces.filter((intf) => 
        intf.name.toLowerCase().includes(query) ||
        intf.path.toLowerCase().includes(query)
      )
    } else {
      return services.filter((svc) =>
        svc.name.toLowerCase().includes(query) ||
        svc.domain.toLowerCase().includes(query) ||
        svc.owner.toLowerCase().includes(query)
      )
    }
  }, [searchQuery, searchType, interfaces, services])

  const getAffectedServices = (interfaceId: string): Service[] => {
    const interfaceServiceId = interfaces.find((i) => i.id === interfaceId)?.serviceId
    if (!interfaceServiceId) return []

    const directCallers = relations
      .filter((r) => r.downstreamServiceId === interfaceServiceId)
      .map((r) => r.upstreamServiceId)

    const allAffectedIds = new Set<string>([interfaceServiceId, ...directCallers])
    
    let toCheck = [...directCallers]
    while (toCheck.length > 0) {
      const current = toCheck.shift()!
      const upstreamOfCurrent = relations
        .filter((r) => r.downstreamServiceId === current)
        .map((r) => r.upstreamServiceId)
      
      upstreamOfCurrent.forEach((id) => {
        if (!allAffectedIds.has(id)) {
          allAffectedIds.add(id)
          toCheck.push(id)
        }
      })
    }

    return services.filter((s) => allAffectedIds.has(s.id))
  }

  const getServiceAlerts = (serviceId: string) => {
    return alerts.filter((a) => a.serviceId === serviceId && !a.isResolved)
  }

  const hasErrorAlert = (serviceId: string) => {
    const serviceAlerts = getServiceAlerts(serviceId)
    return serviceAlerts.some((a) => a.level === 'error' || a.level === 'critical')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold text-white mb-2"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          链路查询
        </h2>
        <p className="text-sm text-gray-400">搜索接口或服务，分析影响范围和异常链路</p>
      </div>

      <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSearchType('interface')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                searchType === 'interface'
                  ? 'bg-[#00D9FF] text-[#0A1628] font-medium'
                  : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
              )}
            >
              <Code className="w-4 h-4" />
              接口搜索
            </button>
            <button
              onClick={() => setSearchType('service')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                searchType === 'service'
                  ? 'bg-[#00D9FF] text-[#0A1628] font-medium'
                  : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
              )}
            >
              <Server className="w-4 h-4" />
              服务搜索
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchType === 'interface' ? '输入接口名称或路径...' : '输入服务名称、业务域或负责人...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={clsx(
              'w-full px-4 py-4 pl-12 bg-[#2E4A6F]/50 rounded-xl text-white',
              'border border-[#2E4A6F] focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 focus:outline-none',
              'placeholder-gray-500 text-lg'
            )}
          />
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-2">
            找到 {searchResults.length} 个结果
          </div>

          {searchType === 'interface' && (searchResults as ServiceInterface[]).map((intf) => {
            const affectedServices = getAffectedServices(intf.id)
            const hasErrors = affectedServices.some((s) => hasErrorAlert(s.id))
            const providerService = services.find((s) => s.id === intf.serviceId)

            return (
              <div 
                key={intf.id}
                className={clsx(
                  'bg-[#1E3A5F]/50 rounded-xl border overflow-hidden',
                  hasErrors ? 'border-[#EF4444]/30' : 'border-[#2E4A6F]'
                )}
              >
                <div className="p-4 border-b border-[#2E4A6F]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium',
                        intf.method === 'GET' && 'bg-[#10B981]/20 text-[#10B981]',
                        intf.method === 'POST' && 'bg-[#00D9FF]/20 text-[#00D9FF]',
                        intf.method === 'PUT' && 'bg-[#F59E0B]/20 text-[#F59E0B]',
                        intf.method === 'DELETE' && 'bg-[#EF4444]/20 text-[#EF4444]',
                        intf.method === 'PATCH' && 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                      )}>
                        {intf.method}
                      </span>
                      <div>
                        <div className="text-white font-medium">{intf.name}</div>
                        <div className="text-xs text-gray-400">{intf.path}</div>
                      </div>
                    </div>
                    {hasErrors && (
                      <div className="flex items-center gap-1 text-[#EF4444]">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">异常链路</span>
                      </div>
                    )}
                  </div>
                  {intf.description && (
                    <div className="text-sm text-gray-400 mt-2">{intf.description}</div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-xs text-gray-400 mb-3">影响范围 ({affectedServices.length} 个服务)</div>
                  <div className="flex flex-wrap gap-2">
                    {affectedServices.map((svc) => {
                      const svcAlerts = getServiceAlerts(svc.id)
                      const hasSvcError = svcAlerts.some((a) => a.level === 'error' || a.level === 'critical')
                      
                      return (
                        <button
                          key={svc.id}
                          onClick={() => navigate(`/service/${svc.id}`)}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                            hasSvcError
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                              : 'bg-[#2E4A6F] text-white hover:bg-[#3E5A7F]'
                          )}
                        >
                          {svc.id === intf.serviceId ? (
                            <span className="text-[#00D9FF]">提供方</span>
                          ) : (
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                          )}
                          <span>{svc.name}</span>
                          {svc.isCore && (
                            <span className="text-[#F59E0B]">★</span>
                          )}
                          {svcAlerts.length > 0 && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${ALERT_LEVEL_COLORS[svcAlerts[0].level]}20`,
                                color: ALERT_LEVEL_COLORS[svcAlerts[0].level]
                              }}
                            >
                              {svcAlerts.length}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {searchType === 'service' && (searchResults as Service[]).map((svc) => {
            const svcAlerts = getServiceAlerts(svc.id)
            const hasSvcError = svcAlerts.some((a) => a.level === 'error' || a.level === 'critical')

            return (
              <button
                key={svc.id}
                onClick={() => navigate(`/service/${svc.id}`)}
                className={clsx(
                  'w-full bg-[#1E3A5F]/50 rounded-xl border p-4 transition-all hover:bg-[#2E4A6F]/50',
                  hasSvcError ? 'border-[#EF4444]/30' : 'border-[#2E4A6F]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      hasSvcError ? 'bg-[#EF4444]/10' : 'bg-[#00D9FF]/10'
                    )}>
                      <Server className={clsx(
                        'w-4 h-4',
                        hasSvcError ? 'text-[#EF4444]' : 'text-[#00D9FF]'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{svc.name}</span>
                        {svc.isCore && (
                          <span className="text-[#F59E0B]">★</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{svc.domain} · {svc.owner}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {svcAlerts.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">{svcAlerts.length} 告警</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">未找到匹配的结果</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">输入关键词开始搜索</p>
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={() => setSearchQuery('/api/user')}
              className="px-3 py-1.5 bg-[#2E4A6F] rounded-lg text-xs text-gray-400 hover:text-white"
            >
              示例: /api/user
            </button>
            <button
              onClick={() => setSearchQuery('order')}
              className="px-3 py-1.5 bg-[#2E4A6F] rounded-lg text-xs text-gray-400 hover:text-white"
            >
              示例: order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}