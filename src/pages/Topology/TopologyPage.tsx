import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopologyCanvas } from '@/components/Topology/TopologyCanvas'
import { FilterPanel } from '@/components/Filter/FilterPanel'
import { useServiceStore } from '@/stores/serviceStore'
import { useTopologyStore } from '@/stores/topologyStore'
import { useAlertStore } from '@/stores/alertStore'
import { initializeMockData } from '@/services/mockDataService'
import { X, ArrowUpCircle, ArrowDownCircle, Star, Download, FileJson, Image } from 'lucide-react'
import clsx from 'clsx'
import html2canvas from 'html2canvas'

export function TopologyPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
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

  const handleExportJson = () => {
    const data = {
      services: useServiceStore.getState().services,
      interfaces: useServiceStore.getState().interfaces,
      relations: useServiceStore.getState().relations,
      exportTime: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `topology-${new Date().toISOString().split('T')[0]}.json`
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
          <div className="bg-[#1E3A5F] rounded-xl border border-[#2E4A6F] p-6 w-80">
            <h3 className="text-lg font-semibold text-white mb-4">导出拓扑快照</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportImage}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'bg-[#2E4A6F] text-white hover:bg-[#3E5A7F] transition-colors'
                )}
              >
                <Image className="w-5 h-5 text-[#00D9FF]" />
                <span>导出为图片 (PNG)</span>
              </button>
              <button
                onClick={handleExportJson}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'bg-[#2E4A6F] text-white hover:bg-[#3E5A7F] transition-colors'
                )}
              >
                <FileJson className="w-5 h-5 text-[#00D9FF]" />
                <span>导出为数据 (JSON)</span>
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-20 right-6 flex gap-2">
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