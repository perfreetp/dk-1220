import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { useTopologyStore } from '@/stores/topologyStore'
import { 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Server,
  Clock,
  Filter,
  FileDown,
  ChevronRight
} from 'lucide-react'
import { Alert, AlertLevel, ALERT_LEVEL_LABELS, ALERT_LEVEL_COLORS } from '@/types'
import clsx from 'clsx'

export function AlertsPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const alerts = useAlertStore((state) => state.alerts)
  const resolveAlert = useAlertStore((state) => state.resolveAlert)
  const selectNode = useTopologyStore((state) => state.selectNode)
  const highlightNodes = useTopologyStore((state) => state.highlightNodes)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)

  const [filterLevel, setFilterLevel] = useState<AlertLevel | null>(null)
  const [showResolved, setShowResolved] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  const filteredAlerts = useMemo(() => {
    let filtered = alerts
    if (!showResolved) {
      filtered = filtered.filter((a) => !a.isResolved)
    }
    if (filterLevel) {
      filtered = filtered.filter((a) => a.level === filterLevel)
    }
    return filtered.sort((a, b) => {
      const levelOrder = { critical: 0, error: 1, warning: 2, info: 3 }
      return levelOrder[a.level] - levelOrder[b.level]
    })
  }, [alerts, filterLevel, showResolved])

  const alertStats = useMemo(() => {
    const unresolved = alerts.filter((a) => !a.isResolved)
    return {
      total: unresolved.length,
      critical: unresolved.filter((a) => a.level === 'critical').length,
      error: unresolved.filter((a) => a.level === 'error').length,
      warning: unresolved.filter((a) => a.level === 'warning').length,
      info: unresolved.filter((a) => a.level === 'info').length
    }
  }, [alerts])

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || '未知服务'
  }

  const getAffectedServices = (alert: Alert): string[] => {
    const service = services.find((s) => s.id === alert.serviceId)
    if (!service) return []

    const relations = useServiceStore.getState().relations
    const downstreamIds = relations
      .filter((r) => r.upstreamServiceId === alert.serviceId)
      .map((r) => r.downstreamServiceId)
    
    return [service.id, ...downstreamIds]
  }

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlertId(alert.id)
    const affectedIds = getAffectedServices(alert)
    highlightNodes(affectedIds)
    selectNode(alert.serviceId)
  }

  const handleResolve = (alertId: string) => {
    resolveAlert(alertId)
    useAlertStore.getState().saveToStorage()
  }

  const handleExportImpactList = () => {
    const unresolvedAlerts = alerts.filter((a) => !a.isResolved)
    const impactData = unresolvedAlerts.map((alert) => {
      const service = services.find((s) => s.id === alert.serviceId)
      const affectedServices = getAffectedServices(alert)
      return {
        alert: {
          title: alert.title,
          level: ALERT_LEVEL_LABELS[alert.level],
          message: alert.message,
          time: alert.alertTime
        },
        service: service?.name,
        affectedServices: affectedServices.map((id) => getServiceName(id))
      }
    })

    const blob = new Blob([JSON.stringify(impactData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `fault-impact-${new Date().toISOString().split('T')[0]}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  const levelFilters: { value: AlertLevel | null; label: string; color?: string }[] = [
    { value: null, label: '全部' },
    { value: 'critical', label: '严重', color: '#DC2626' },
    { value: 'error', label: '错误', color: '#EF4444' },
    { value: 'warning', label: '警告', color: '#F59E0B' },
    { value: 'info', label: '信息', color: '#3B82F6' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-xl font-semibold text-white mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            告警面板
          </h2>
          <p className="text-sm text-gray-400">实时监控服务告警，分析故障影响范围</p>
        </div>
        <button
          onClick={handleExportImpactList}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30',
            'hover:bg-[#EF4444]/20 transition-colors'
          )}
        >
          <FileDown className="w-4 h-4" />
          导出故障影响清单
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">总告警</span>
            <Bell className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-white">{alertStats.total}</div>
        </div>
        <div className="bg-[#DC2626]/10 rounded-xl border border-[#DC2626]/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#DC2626]">严重</span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-semibold text-[#DC2626]">{alertStats.critical}</div>
        </div>
        <div className="bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#EF4444]">错误</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-semibold text-[#EF4444]">{alertStats.error}</div>
        </div>
        <div className="bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#F59E0B]">警告</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-semibold text-[#F59E0B]">{alertStats.warning}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">筛选:</span>
        </div>
        <div className="flex gap-2">
          {levelFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setFilterLevel(filter.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                filterLevel === filter.value
                  ? filter.color 
                    ? `bg-[${filter.color}]/20 text-[${filter.color}] border border-[${filter.color}]/50`
                    : 'bg-[#00D9FF] text-[#0A1628] font-medium'
                  : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
              )}
              style={{
                backgroundColor: filterLevel === filter.value && filter.color ? `${filter.color}20` : undefined,
                color: filterLevel === filter.value && filter.color ? filter.color : undefined,
                borderColor: filterLevel === filter.value && filter.color ? `${filter.color}50` : undefined
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
            showResolved
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
              : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
          )}
        >
          <CheckCircle className="w-3 h-3" />
          显示已处理
        </button>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isSelected = selectedAlertId === alert.id
          const service = services.find((s) => s.id === alert.serviceId)
          const affectedServices = getAffectedServices(alert)

          return (
            <div 
              key={alert.id}
              className={clsx(
                'bg-[#1E3A5F]/50 rounded-xl border overflow-hidden transition-all',
                isSelected ? 'border-[#00D9FF]' : 'border-[#2E4A6F]',
                alert.isResolved && 'opacity-50'
              )}
            >
              <div 
                className="p-4 cursor-pointer hover:bg-[#2E4A6F]/30"
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${ALERT_LEVEL_COLORS[alert.level]}20` }}
                    >
                      <AlertTriangle 
                        className="w-4 h-4" 
                        style={{ color: ALERT_LEVEL_COLORS[alert.level] }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{alert.title}</span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${ALERT_LEVEL_COLORS[alert.level]}20`,
                            color: ALERT_LEVEL_COLORS[alert.level]
                          }}
                        >
                          {ALERT_LEVEL_LABELS[alert.level]}
                        </span>
                        {alert.isResolved && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[#10B981]/20 text-[#10B981]">
                            已处理
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          <span>{service?.name || '未知服务'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.alertTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.isResolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResolve(alert.id)
                        }}
                        className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                        title="标记为已处理"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="px-4 pb-4 pt-2 border-t border-[#2E4A6F]">
                  <div className="text-sm text-gray-300 mb-3">{alert.message}</div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-2">影响范围 ({affectedServices.length} 个服务)</div>
                    <div className="flex flex-wrap gap-2">
                      {affectedServices.map((serviceId) => {
                        const svc = services.find((s) => s.id === serviceId)
                        return (
                          <button
                            key={serviceId}
                            onClick={() => navigate(`/service/${serviceId}`)}
                            className={clsx(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                              serviceId === alert.serviceId
                                ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                                : 'bg-[#2E4A6F] text-white hover:bg-[#3E5A7F]'
                            )}
                          >
                            <Server className="w-3 h-3" />
                            {svc?.name || '未知'}
                            {svc?.isCore && <span className="text-[#F59E0B]">★</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/topology')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20"
                  >
                    在拓扑图中查看
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {showResolved ? '暂无告警记录' : '暂无未处理告警'}
          </p>
        </div>
      )}
    </div>
  )
}