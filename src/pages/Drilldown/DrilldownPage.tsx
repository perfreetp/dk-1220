import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { useTopologyStore } from '@/stores/topologyStore'
import { 
  AlertTriangle,
  Server,
  User,
  Clock,
  GitBranch,
  Star,
  Download,
  ArrowLeft,
  Layers,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Alert, ALERT_LEVEL_LABELS, ALERT_LEVEL_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types'
import clsx from 'clsx'

export function DrilldownPage() {
  const { alertId } = useParams<{ alertId: string }>()
  const navigate = useNavigate()
  
  const services = useServiceStore((state) => state.services)
  const relations = useServiceStore((state) => state.relations)
  const changeRecords = useServiceStore((state) => state.changeRecords)
  const getAffectedServices = useServiceStore((state) => state.getAffectedServices)
  const getUpstreamServices = useServiceStore((state) => state.getUpstreamServices)
  const getDownstreamServices = useServiceStore((state) => state.getDownstreamServices)
  const alerts = useAlertStore((state) => state.alerts)
  const highlightNodes = useTopologyStore((state) => state.highlightNodes)
  const selectNode = useTopologyStore((state) => state.selectNode)

  const [expandedLevels, setExpandedLevels] = useState<number[]>([0])

  const alert = alerts.find((a) => a.id === alertId)
  
  const affectedServices = useMemo(() => {
    if (!alert) return []
    return getAffectedServices(alert.serviceId)
  }, [alert, getAffectedServices])

  const impactTree = useMemo(() => {
    if (!alert || affectedServices.length === 0) return []
    
    const rootService = services.find((s) => s.id === alert.serviceId)
    if (!rootService) return []

    const buildTree = (serviceId: string, level: number): any[] => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return []

      const downstream = getDownstreamServices(serviceId)
      const children = downstream.flatMap((child) => buildTree(child.id, level + 1))

      return [{
        service,
        level,
        children,
        hasChildren: children.length > 0
      }]
    }

    return buildTree(alert.serviceId, 0)
  }, [alert, services, getDownstreamServices])

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => 
      prev.includes(level) 
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    )
  }

  const coreServices = useMemo(() => {
    return affectedServices.filter((s) => s.isCore)
  }, [affectedServices])

  const criticalServices = useMemo(() => {
    return affectedServices.filter((s) => s.status !== 'normal')
  }, [affectedServices])

  const recentChanges = useMemo(() => {
    const affectedServiceIds = affectedServices.map((s) => s.id)
    return changeRecords
      .filter((r) => affectedServiceIds.includes(r.serviceId))
      .slice(0, 5)
  }, [affectedServices, changeRecords])

  const uniqueOwners = useMemo(() => {
    const owners = new Map<string, { services: string[]; count: number }>()
    affectedServices.forEach((service) => {
      if (!owners.has(service.owner)) {
        owners.set(service.owner, { services: [], count: 0 })
      }
      const ownerData = owners.get(service.owner)!
      ownerData.services.push(service.name)
      ownerData.count++
    })
    return Array.from(owners.entries()).map(([name, data]) => ({
      name,
      ...data
    }))
  }, [affectedServices])

  const handleExportImpactList = () => {
    if (!alert) return
    
    const service = services.find((s) => s.id === alert.serviceId)
    const exportData = {
      exportTime: new Date().toISOString(),
      drilldownFor: {
        alertId: alert.id,
        alertTitle: alert.title,
        alertLevel: ALERT_LEVEL_LABELS[alert.level],
        alertMessage: alert.message,
        alertTime: alert.alertTime,
        formattedTime: new Date(alert.alertTime).toLocaleString()
      },
      rootService: service ? {
        id: service.id,
        name: service.name,
        domain: service.domain,
        owner: service.owner,
        status: service.status,
        isCore: service.isCore
      } : null,
      impactSummary: {
        totalAffected: affectedServices.length,
        coreServices: coreServices.length,
        criticalServices: criticalServices.length,
        uniqueOwners: uniqueOwners.length
      },
      impactTree,
      affectedServices: affectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        owner: s.owner,
        status: s.status,
        isCore: s.isCore,
        level: getServiceLevel(s.id)
      })),
      criticalServices: criticalServices.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        owner: s.owner,
        status: s.status
      })),
      responsibleOwners: uniqueOwners,
      recentChanges: recentChanges.map((c) => ({
        id: c.id,
        serviceId: c.serviceId,
        serviceName: services.find((s) => s.id === c.serviceId)?.name || '未知',
        title: c.title,
        content: c.content,
        changeType: c.changeType,
        operator: c.operator,
        changeTime: c.changeTime
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `drilldown-${alert.id}-${new Date().toISOString().split('T')[0]}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  const getServiceLevel = (serviceId: string): number => {
    const findLevel = (tree: any[], targetId: string, currentLevel: number): number => {
      for (const node of tree) {
        if (node.service.id === targetId) return currentLevel
        if (node.children.length > 0) {
          const found = findLevel(node.children, targetId, currentLevel + 1)
          if (found !== -1) return found
        }
      }
      return -1
    }
    return findLevel(impactTree, serviceId, 0)
  }

  const renderTree = (nodes: any[], currentLevel: number = 0) => {
    return nodes.map((node) => (
      <div key={node.service.id}>
        <div 
          className="flex items-center gap-3 p-3 bg-[#2E4A6F]/50 rounded-lg hover:bg-[#2E4A6F]"
          onClick={() => {
            selectNode(node.service.id)
            highlightNodes([node.service.id])
            navigate('/topology')
          }}
        >
          <div className="flex items-center gap-2">
            {node.hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLevel(currentLevel)
                }}
                className="text-gray-400 hover:text-white"
              >
                {expandedLevels.includes(currentLevel) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
            {!node.hasChildren && <span className="w-5" />}
            
            <div 
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: `${STATUS_COLORS[node.service.status]}20` }}
            >
              <Server className="w-4 h-4" style={{ color: STATUS_COLORS[node.service.status] }} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">
                  {node.service.name}
                </span>
                {node.service.isCore && (
                  <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                )}
                <span 
                  className="px-1.5 py-0.5 rounded text-[10px]"
                  style={{ 
                    backgroundColor: `${STATUS_COLORS[node.service.status]}20`,
                    color: STATUS_COLORS[node.service.status]
                  }}
                >
                  {STATUS_LABELS[node.service.status]}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {node.service.domain} · {node.service.owner}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              L{currentLevel}
            </div>
          </div>
        </div>
        
        {node.hasChildren && expandedLevels.includes(currentLevel) && (
          <div className="ml-4 mt-2">
            {renderTree(node.children, currentLevel + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (!alert) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回告警面板</span>
        </button>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">未找到指定的告警</p>
        </div>
      </div>
    )
  }

  const rootService = services.find((s) => s.id === alert.serviceId)

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/alerts')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回告警面板</span>
      </button>

      <div className="bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${ALERT_LEVEL_COLORS[alert.level]}20` }}
            >
              <AlertTriangle 
                className="w-6 h-6" 
                style={{ color: ALERT_LEVEL_COLORS[alert.level] }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 
                  className="text-xl font-semibold text-white"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  故障演练视图
                </h2>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${ALERT_LEVEL_COLORS[alert.level]}20`,
                    color: ALERT_LEVEL_COLORS[alert.level]
                  }}
                >
                  {ALERT_LEVEL_LABELS[alert.level]}
                </span>
              </div>
              <p className="text-gray-300 mt-2">{alert.title}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Server className="w-4 h-4" />
                  {rootService?.name || '未知服务'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(alert.alertTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleExportImpactList}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
              'hover:bg-[#00D9FF]/20 transition-colors'
            )}
          >
            <Download className="w-4 h-4" />
            导出影响清单
          </button>
        </div>
        <div className="mt-4 p-3 bg-[#0A1628]/50 rounded-lg">
          <p className="text-sm text-gray-300">{alert.message}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Layers className="w-4 h-4" />
            <span>受影响服务</span>
          </div>
          <div className="text-2xl font-semibold text-white">{affectedServices.length}</div>
        </div>
        <div className="bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/30 p-4">
          <div className="flex items-center gap-2 text-xs text-[#F59E0B] mb-2">
            <Star className="w-4 h-4" />
            <span>核心服务</span>
          </div>
          <div className="text-2xl font-semibold text-[#F59E0B]">{coreServices.length}</div>
        </div>
        <div className="bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 p-4">
          <div className="flex items-center gap-2 text-xs text-[#EF4444] mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>异常服务</span>
          </div>
          <div className="text-2xl font-semibold text-[#EF4444]">{criticalServices.length}</div>
        </div>
        <div className="bg-[#10B981]/10 rounded-xl border border-[#10B981]/30 p-4">
          <div className="flex items-center gap-2 text-xs text-[#10B981] mb-2">
            <User className="w-4 h-4" />
            <span>关联负责人</span>
          </div>
          <div className="text-2xl font-semibold text-[#10B981]">{uniqueOwners.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-[#00D9FF]" />
              <h3 className="font-semibold text-white">影响链路层级</h3>
            </div>
            {impactTree.length > 0 ? (
              <div className="space-y-2">
                {renderTree(impactTree)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                暂无影响链路数据
              </div>
            )}
          </div>

          <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              <h3 className="font-semibold text-white">异常服务列表</h3>
            </div>
            {criticalServices.length > 0 ? (
              <div className="space-y-2">
                {criticalServices.map((service) => (
                  <div 
                    key={service.id}
                    className="flex items-center gap-3 p-3 bg-[#EF4444]/10 rounded-lg"
                  >
                    <Server className="w-4 h-4 text-[#EF4444]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{service.name}</span>
                        {service.isCore && <Star className="w-3 h-3 text-[#F59E0B]" />}
                      </div>
                      <div className="text-xs text-gray-400">{service.domain}</div>
                    </div>
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${STATUS_COLORS[service.status]}20`,
                        color: STATUS_COLORS[service.status]
                      }}
                    >
                      {STATUS_LABELS[service.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6 text-[#10B981]">
                <CheckCircle className="w-5 h-5" />
                <span>暂无异常服务</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#10B981]" />
              <h3 className="font-semibold text-white">关联负责人</h3>
            </div>
            {uniqueOwners.length > 0 ? (
              <div className="space-y-2">
                {uniqueOwners.map((owner) => (
                  <div key={owner.name} className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">{owner.name}</span>
                      <span className="text-xs text-gray-400">{owner.count} 个服务</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {owner.services.slice(0, 3).map((service) => (
                        <span 
                          key={service} 
                          className="px-2 py-0.5 bg-[#1E3A5F] rounded text-xs text-gray-400"
                        >
                          {service}
                        </span>
                      ))}
                      {owner.services.length > 3 && (
                        <span className="px-2 py-0.5 bg-[#1E3A5F] rounded text-xs text-gray-500">
                          +{owner.services.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">暂无负责人数据</div>
            )}
          </div>

          <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#00D9FF]" />
              <h3 className="font-semibold text-white">最近变更</h3>
            </div>
            {recentChanges.length > 0 ? (
              <div className="space-y-2">
                {recentChanges.map((change) => {
                  const serviceName = services.find((s) => s.id === change.serviceId)?.name || '未知'
                  return (
                    <div key={change.id} className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                      <div className="text-sm text-white">{change.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {serviceName} · {change.operator}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(change.changeTime).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">暂无变更记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}