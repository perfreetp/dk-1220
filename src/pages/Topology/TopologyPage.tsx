import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopologyCanvas } from '@/components/Topology/TopologyCanvas'
import { FilterPanel } from '@/components/Filter/FilterPanel'
import { useServiceStore } from '@/stores/serviceStore'
import { useTopologyStore } from '@/stores/topologyStore'
import { useAlertStore } from '@/stores/alertStore'
import { initializeMockData } from '@/services/mockDataService'
import { 
  X, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Star, 
  Download, 
  FileJson, 
  Image,
  RefreshCw,
  Plus,
  Clock,
  AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'
import html2canvas from 'html2canvas'
import { Environment } from '@/types'

export function TopologyPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const interfaces = useServiceStore((state) => state.interfaces)
  const relations = useServiceStore((state) => state.relations)
  const changeRecords = useServiceStore((state) => state.changeRecords)
  const selectedNodeId = useTopologyStore((state) => state.selectedNodeId)
  const highlightedNodes = useTopologyStore((state) => state.highlightedNodes)
  const selectNode = useTopologyStore((state) => state.selectNode)
  const highlightUpstream = useTopologyStore((state) => state.highlightUpstream)
  const highlightDownstream = useTopologyStore((state) => state.highlightDownstream)
  const clearHighlight = useTopologyStore((state) => state.clearHighlight)
  const getUpstreamServices = useServiceStore((state) => state.getUpstreamServices)
  const getDownstreamServices = useServiceStore((state) => state.getDownstreamServices)
  const loadFromStorage = useServiceStore((state) => state.loadFromStorage)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)
  const alerts = useAlertStore((state) => state.alerts)
  
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    environment: Environment.PRODUCTION as Environment | 'all',
    domain: 'all' as string,
    onlyCore: false,
    includeAlerts: true,
    includeChanges: true
  })

  useEffect(() => {
    const storedData = localStorage.getItem('service-topology-data')
    if (!storedData || JSON.parse(storedData).services?.length === 0) {
      const mockData = initializeMockData()
      useServiceStore.setState({
        services: mockData.services,
        interfaces: mockData.interfaces,
        relations: mockData.relations,
        changeRecords: mockData.changeRecords
      })
      useAlertStore.setState({ alerts: mockData.alerts })
      saveToStorage()
    } else {
      loadFromStorage()
      useAlertStore.getState().loadFromStorage()
    }
  }, [])

  useEffect(() => {
    setShowDetailPanel(selectedNodeId !== null)
  }, [selectedNodeId])

  const selectedService = services.find((s) => s.id === selectedNodeId)
  const upstreamServices = selectedNodeId ? getUpstreamServices(selectedNodeId) : []
  const downstreamServices = selectedNodeId ? getDownstreamServices(selectedNodeId) : []

  const domains = [...new Set(services.map((s) => s.domain))]
  const environments = [
    { value: 'all' as const, label: '全部环境' },
    { value: Environment.PRODUCTION, label: '生产环境' },
    { value: Environment.STAGING, label: '预发环境' },
    { value: Environment.TESTING, label: '测试环境' },
    { value: Environment.DEVELOPMENT, label: '开发环境' }
  ]

  const handleClosePanel = () => {
    selectNode(null)
    clearHighlight()
  }

  const handleShowUpstream = () => {
    if (selectedNodeId) {
      const upstreamIds = upstreamServices.map((s) => s.id)
      highlightUpstream(selectedNodeId, upstreamIds)
    }
  }

  const handleShowDownstream = () => {
    if (selectedNodeId) {
      const downstreamIds = downstreamServices.map((s) => s.id)
      highlightDownstream(selectedNodeId, downstreamIds)
    }
  }

  const handleExportImage = async () => {
    const canvas = document.querySelector('.react-flow') as HTMLElement
    if (canvas) {
      const screenshot = await html2canvas(canvas, {
        backgroundColor: '#0A1628',
        scale: 2
      })
      const link = document.createElement('a')
      link.download = `topology-${new Date().toISOString().split('T')[0]}.png`
      link.href = screenshot.toDataURL()
      link.click()
    }
    setShowExportModal(false)
  }

  const handleExportSnapshot = () => {
    let filteredServices = services
    let filteredRelations = relations
    let filteredInterfaces = interfaces

    if (exportOptions.environment !== 'all') {
      filteredServices = filteredServices.filter((s) => s.environment === exportOptions.environment)
      const serviceIds = filteredServices.map((s) => s.id)
      filteredRelations = filteredRelations.filter(
        (r) => serviceIds.includes(r.upstreamServiceId) && serviceIds.includes(r.downstreamServiceId)
      )
      filteredInterfaces = filteredInterfaces.filter((i) => serviceIds.includes(i.serviceId))
    }

    if (exportOptions.domain !== 'all') {
      filteredServices = filteredServices.filter((s) => s.domain === exportOptions.domain)
      const serviceIds = filteredServices.map((s) => s.id)
      filteredRelations = filteredRelations.filter(
        (r) => serviceIds.includes(r.upstreamServiceId) && serviceIds.includes(r.downstreamServiceId)
      )
      filteredInterfaces = filteredInterfaces.filter((i) => serviceIds.includes(i.serviceId))
    }

    if (exportOptions.onlyCore) {
      filteredServices = filteredServices.filter((s) => s.isCore)
      const serviceIds = filteredServices.map((s) => s.id)
      filteredRelations = filteredRelations.filter(
        (r) => serviceIds.includes(r.upstreamServiceId) && serviceIds.includes(r.downstreamServiceId)
      )
      filteredInterfaces = filteredInterfaces.filter((i) => serviceIds.includes(i.serviceId))
    }

    const abnormalServices = filteredServices.filter((s) => s.status !== 'normal')
    const recentChanges = exportOptions.includeChanges
      ? changeRecords.slice(0, 10)
      : []
    const activeAlerts = exportOptions.includeAlerts
      ? alerts.filter((a) => !a.isResolved && filteredServices.some((s) => s.id === a.serviceId))
      : []

    const snapshot = {
      exportTime: new Date().toISOString(),
      filterConditions: {
        environment: exportOptions.environment === 'all' ? '全部' : 
          environments.find((e) => e.value === exportOptions.environment)?.label || '未知',
        domain: exportOptions.domain === 'all' ? '全部' : exportOptions.domain,
        onlyCore: exportOptions.onlyCore,
        includeAlerts: exportOptions.includeAlerts,
        includeChanges: exportOptions.includeChanges
      },
      summary: {
        totalServices: filteredServices.length,
        coreServices: filteredServices.filter((s) => s.isCore).length,
        abnormalServices: abnormalServices.length,
        totalInterfaces: filteredInterfaces.length,
        totalRelations: filteredRelations.length,
        activeAlerts: activeAlerts.length,
        recentChanges: recentChanges.length
      },
      services: filteredServices.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        environment: s.environment,
        status: s.status,
        isCore: s.isCore,
        owner: s.owner,
        description: s.description
      })),
      interfaces: filteredInterfaces.map((i) => ({
        id: i.id,
        serviceId: i.serviceId,
        name: i.name,
        path: i.path,
        method: i.method
      })),
      relations: filteredRelations.map((r) => ({
        id: r.id,
        upstreamServiceId: r.upstreamServiceId,
        downstreamServiceId: r.downstreamServiceId,
        callType: r.callType,
        callFrequency: r.callFrequency
      })),
      abnormalServices: abnormalServices.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        status: s.status,
        owner: s.owner
      })),
      activeAlerts: activeAlerts.map((a) => ({
        id: a.id,
        serviceId: a.serviceId,
        serviceName: filteredServices.find((s) => s.id === a.serviceId)?.name || '未知',
        title: a.title,
        level: a.level,
        message: a.message,
        alertTime: a.alertTime
      })),
      recentChanges: recentChanges.map((c) => ({
        id: c.id,
        serviceId: c.serviceId,
        serviceName: filteredServices.find((s) => s.id === c.serviceId)?.name || '未知',
        changeType: c.changeType,
        title: c.title,
        content: c.content,
        operator: c.operator,
        changeTime: c.changeTime
      }))
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `topology-snapshot-${new Date().toISOString().split('T')[0]}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    setShowExportModal(false)
  }

  const handleRefresh = () => {
    loadFromStorage()
    useAlertStore.getState().loadFromStorage()
  }

  const handleAddService = () => {
    navigate('/service/new')
  }

  const serviceAlerts = selectedNodeId 
    ? alerts.filter((a) => a.serviceId === selectedNodeId && !a.isResolved)
    : []

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <FilterPanel />
      
      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          <TopologyCanvas onNodeClick={(id) => selectNode(id)} />
        </div>

        {showDetailPanel && selectedService && (
          <div className="w-80 bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-[#2E4A6F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {selectedService.name}
                  </span>
                  {selectedService.isCore && (
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  )}
                </div>
                <button
                  onClick={handleClosePanel}
                  className="p-1 rounded hover:bg-[#2E4A6F] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-400 mt-1">{selectedService.domain}</div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-4rem)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                  <div className="text-xs text-gray-400">负责人</div>
                  <div className="text-sm text-white mt-1">{selectedService.owner}</div>
                </div>
                <div className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                  <div className="text-xs text-gray-400">环境</div>
                  <div className="text-sm text-white mt-1">
                    {selectedService.environment === 'production' ? '生产环境' : 
                     selectedService.environment === 'staging' ? '预发环境' :
                     selectedService.environment === 'testing' ? '测试环境' : '开发环境'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">状态</div>
                <div 
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                    selectedService.status === 'normal' && 'bg-[#10B981]/20 text-[#10B981]',
                    selectedService.status === 'warning' && 'bg-[#F59E0B]/20 text-[#F59E0B]',
                    selectedService.status === 'error' && 'bg-[#EF4444]/20 text-[#EF4444]',
                    selectedService.status === 'offline' && 'bg-gray-500/20 text-gray-400'
                  )}
                >
                  {selectedService.status === 'normal' ? '正常' : 
                   selectedService.status === 'warning' ? '警告' :
                   selectedService.status === 'error' ? '异常' : '离线'}
                </div>
              </div>

              <div className="p-3 bg-[#2E4A6F]/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">描述</div>
                <div className="text-sm text-white">{selectedService.description}</div>
              </div>

              {serviceAlerts.length > 0 && (
                <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30">
                  <div className="text-xs text-[#EF4444] mb-2">当前告警 ({serviceAlerts.length})</div>
                  {serviceAlerts.map((alert) => (
                    <div key={alert.id} className="text-sm text-white mb-1">
                      {alert.title}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs text-gray-400">依赖分析</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShowUpstream}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
                      'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30',
                      'hover:bg-[#10B981]/20 transition-colors'
                    )}
                  >
                    <ArrowUpCircle className="w-3 h-3" />
                    <span>上游 ({upstreamServices.length})</span>
                  </button>
                  <button
                    onClick={handleShowDownstream}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
                      'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
                      'hover:bg-[#00D9FF]/20 transition-colors'
                    )}
                  >
                    <ArrowDownCircle className="w-3 h-3" />
                    <span>下游 ({downstreamServices.length})</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate(`/service/${selectedService.id}`)}
                className={clsx(
                  'w-full py-2 rounded-lg text-sm',
                  'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
                  'hover:bg-[#00D9FF]/20 transition-colors'
                )}
              >
                查看完整详情
              </button>
            </div>
          </div>
        )}
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E3A5F] rounded-xl border border-[#2E4A6F] p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">导出拓扑快照</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2">选择环境</label>
                <select
                  value={exportOptions.environment}
                  onChange={(e) => setExportOptions({ ...exportOptions, environment: e.target.value as Environment | 'all' })}
                  className={clsx(
                    'w-full px-4 py-2 bg-[#2E4A6F]/50 rounded-lg text-white',
                    'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none'
                  )}
                >
                  {environments.map((env) => (
                    <option key={env.value} value={env.value}>{env.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">选择业务域</label>
                <select
                  value={exportOptions.domain}
                  onChange={(e) => setExportOptions({ ...exportOptions, domain: e.target.value })}
                  className={clsx(
                    'w-full px-4 py-2 bg-[#2E4A6F]/50 rounded-lg text-white',
                    'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none'
                  )}
                >
                  <option value="all">全部业务域</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.onlyCore}
                    onChange={(e) => setExportOptions({ ...exportOptions, onlyCore: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-[#2E4A6F] text-[#00D9FF] focus:ring-[#00D9FF]"
                  />
                  <span className="text-sm text-gray-300">仅导出核心服务</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAlerts}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeAlerts: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-[#2E4A6F] text-[#00D9FF] focus:ring-[#00D9FF]"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                    包含当前告警
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeChanges}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeChanges: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-[#2E4A6F] text-[#00D9FF] focus:ring-[#00D9FF]"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00D9FF]" />
                    包含最近变更记录
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#2E4A6F]">
                <button
                  onClick={handleExportSnapshot}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                    'bg-[#00D9FF] text-[#0A1628] font-medium',
                    'hover:bg-[#00D9FF]/80 transition-colors'
                  )}
                >
                  <FileJson className="w-4 h-4" />
                  <span>导出快照数据</span>
                </button>
                <button
                  onClick={handleExportImage}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                    'bg-[#2E4A6F] text-white hover:bg-[#3E5A7F] transition-colors'
                  )}
                >
                  <Image className="w-4 h-4 text-[#00D9FF]" />
                  <span>导出图片</span>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-20 right-6 flex gap-2">
        <button
          onClick={handleAddService}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-[#00D9FF] text-[#0A1628] font-medium',
            'hover:bg-[#00D9FF]/80',
            'transition-all duration-200 text-sm'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>新增服务</span>
        </button>
        <button
          onClick={handleRefresh}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-[#1E3A5F] text-gray-400 border border-[#1E3A5F]',
            'hover:text-white hover:border-[#00D9FF]/30',
            'transition-all duration-200 text-sm'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          <span>刷新</span>
        </button>
        <button
          onClick={() => setShowExportModal(true)}
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
      </div>
    </div>
  )
}