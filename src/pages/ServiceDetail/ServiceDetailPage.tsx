import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { 
  Server, 
  Star, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Edit2, 
  Trash2,
  Plus,
  X,
  Save,
  AlertTriangle,
  Code,
  Clock
} from 'lucide-react'
import { Service, ServiceInterface, STATUS_COLORS, STATUS_LABELS } from '@/types'
import clsx from 'clsx'

export function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const interfaces = useServiceStore((state) => state.interfaces)
  const relations = useServiceStore((state) => state.relations)
  const changeRecords = useServiceStore((state) => state.changeRecords)
  const updateService = useServiceStore((state) => state.updateService)
  const deleteService = useServiceStore((state) => state.deleteService)
  const addInterface = useServiceStore((state) => state.addInterface)
  const deleteInterface = useServiceStore((state) => state.deleteInterface)
  const alerts = useAlertStore((state) => state.alerts)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)

  const [isEditing, setIsEditing] = useState(false)
  const [editedService, setEditedService] = useState<Service | null>(null)
  const [showAddInterface, setShowAddInterface] = useState(false)
  const [newInterface, setNewInterface] = useState({
    name: '',
    path: '',
    method: 'GET' as const,
    description: ''
  })

  const service = services.find((s) => s.id === id)
  const serviceInterfaces = interfaces.filter((i) => i.serviceId === id)
  const upstreamRelations = relations.filter((r) => r.downstreamServiceId === id)
  const downstreamRelations = relations.filter((r) => r.upstreamServiceId === id)
  const upstreamServices = services.filter((s) => 
    upstreamRelations.some((r) => r.upstreamServiceId === s.id)
  )
  const downstreamServices = services.filter((s) => 
    downstreamRelations.some((r) => r.downstreamServiceId === s.id)
  )
  const serviceAlerts = alerts.filter((a) => a.serviceId === id && !a.isResolved)
  const serviceChanges = changeRecords.filter((c) => c.serviceId === id)

  useEffect(() => {
    if (service && !isEditing) {
      setEditedService(service)
    }
  }, [service, isEditing])

  if (!service) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">服务不存在</p>
          <button
            onClick={() => navigate('/topology')}
            className="mt-4 px-4 py-2 bg-[#00D9FF]/10 text-[#00D9FF] rounded-lg hover:bg-[#00D9FF]/20 transition-colors"
          >
            返回拓扑总览
          </button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (editedService) {
      updateService(id!, editedService)
      saveToStorage()
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除此服务吗？')) {
      deleteService(id!)
      saveToStorage()
      navigate('/topology')
    }
  }

  const handleAddInterface = () => {
    if (newInterface.name && newInterface.path) {
      addInterface({
        id: `int-${Date.now()}`,
        serviceId: id!,
        ...newInterface
      })
      saveToStorage()
      setNewInterface({ name: '', path: '', method: 'GET', description: '' })
      setShowAddInterface(false)
    }
  }

  const handleDeleteInterface = (interfaceId: string) => {
    deleteInterface(interfaceId)
    saveToStorage()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] overflow-hidden">
        <div className="p-6 border-b border-[#2E4A6F]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#00D9FF]/10 rounded-lg">
                <Server className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {service.name}
                  </span>
                  {service.isCore && (
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  )}
                </div>
                <div className="text-sm text-gray-400">{service.domain}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                  isEditing 
                    ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                    : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
                )}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? '取消' : '编辑'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/20"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {serviceAlerts.length > 0 && (
            <div className="p-4 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30">
              <div className="flex items-center gap-2 text-[#EF4444] mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">当前告警 ({serviceAlerts.length})</span>
              </div>
              <div className="space-y-2">
                {serviceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-[#1E3A5F] rounded">
                    <div>
                      <div className="text-sm text-white">{alert.title}</div>
                      <div className="text-xs text-gray-400">{alert.message}</div>
                    </div>
                    <div className={clsx(
                      'px-2 py-1 rounded text-xs',
                      alert.level === 'critical' && 'bg-[#DC2626] text-white',
                      alert.level === 'error' && 'bg-[#EF4444] text-white',
                      alert.level === 'warning' && 'bg-[#F59E0B] text-white'
                    )}>
                      {alert.level === 'critical' ? '严重' : alert.level === 'error' ? '错误' : '警告'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">服务名称</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedService?.name || ''}
                  onChange={(e) => setEditedService({ ...editedService!, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                />
              ) : (
                <div className="text-white">{service.name}</div>
              )}
            </div>
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">负责人</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedService?.owner || ''}
                  onChange={(e) => setEditedService({ ...editedService!, owner: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                />
              ) : (
                <div className="text-white">{service.owner}</div>
              )}
            </div>
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">业务域</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedService?.domain || ''}
                  onChange={(e) => setEditedService({ ...editedService!, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                />
              ) : (
                <div className="text-white">{service.domain}</div>
              )}
            </div>
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">环境</label>
              <div className="text-white">
                {service.environment === 'production' ? '生产环境' : 
                 service.environment === 'staging' ? '预发环境' :
                 service.environment === 'testing' ? '测试环境' : '开发环境'}
              </div>
            </div>
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">状态</label>
              <div 
                className={clsx(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm',
                  `bg-[${STATUS_COLORS[service.status]}]/20`,
                  `text-[${STATUS_COLORS[service.status]}]`
                )}
                style={{
                  backgroundColor: `${STATUS_COLORS[service.status]}20`,
                  color: STATUS_COLORS[service.status]
                }}
              >
                {STATUS_LABELS[service.status]}
              </div>
            </div>
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">核心服务</label>
              {isEditing ? (
                <button
                  onClick={() => setEditedService({ ...editedService!, isCore: !editedService?.isCore })}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    editedService?.isCore 
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B]' 
                      : 'bg-[#2E4A6F] text-gray-400'
                  )}
                >
                  <Star className={clsx('w-4 h-4', editedService?.isCore && 'fill-current')} />
                  {editedService?.isCore ? '是' : '否'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-white">
                  {service.isCore && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />}
                  {service.isCore ? '是' : '否'}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
            <label className="text-xs text-gray-400 block mb-2">描述</label>
            {isEditing ? (
              <textarea
                value={editedService?.description || ''}
                onChange={(e) => setEditedService({ ...editedService!, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none resize-none"
                rows={3}
              />
            ) : (
              <div className="text-white">{service.description}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#10B981]/10 rounded-lg border border-[#10B981]/30">
              <div className="flex items-center gap-2 text-[#10B981] mb-3">
                <ArrowUpCircle className="w-4 h-4" />
                <span className="font-medium">上游依赖 ({upstreamServices.length})</span>
              </div>
              <div className="space-y-2">
                {upstreamServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/service/${s.id}`)}
                    className="w-full p-2 bg-[#1E3A5F] rounded-lg text-sm text-white hover:bg-[#2E4A6F] transition-colors text-left"
                  >
                    {s.name}
                  </button>
                ))}
                {upstreamServices.length === 0 && (
                  <div className="text-sm text-gray-400">无上游依赖</div>
                )}
              </div>
            </div>
            <div className="p-4 bg-[#00D9FF]/10 rounded-lg border border-[#00D9FF]/30">
              <div className="flex items-center gap-2 text-[#00D9FF] mb-3">
                <ArrowDownCircle className="w-4 h-4" />
                <span className="font-medium">下游服务 ({downstreamServices.length})</span>
              </div>
              <div className="space-y-2">
                {downstreamServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/service/${s.id}`)}
                    className="w-full p-2 bg-[#1E3A5F] rounded-lg text-sm text-white hover:bg-[#2E4A6F] transition-colors text-left"
                  >
                    {s.name}
                  </button>
                ))}
                {downstreamServices.length === 0 && (
                  <div className="text-sm text-gray-400">无下游服务</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00D9FF]" />
                <span className="font-medium text-white">接口列表 ({serviceInterfaces.length})</span>
              </div>
              <button
                onClick={() => setShowAddInterface(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30 hover:bg-[#00D9FF]/20"
              >
                <Plus className="w-3 h-3" />
                新增接口
              </button>
            </div>

            {showAddInterface && (
              <div className="mb-4 p-4 bg-[#1E3A5F] rounded-lg border border-[#00D9FF]/30">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="接口名称"
                    value={newInterface.name}
                    onChange={(e) => setNewInterface({ ...newInterface, name: e.target.value })}
                    className="px-3 py-2 bg-[#2E4A6F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="接口路径"
                    value={newInterface.path}
                    onChange={(e) => setNewInterface({ ...newInterface, path: e.target.value })}
                    className="px-3 py-2 bg-[#2E4A6F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 mb-3">
                  <select
                    value={newInterface.method}
                    onChange={(e) => setNewInterface({ ...newInterface, method: e.target.value as any })}
                    className="px-3 py-2 bg-[#2E4A6F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  <input
                    type="text"
                    placeholder="接口描述"
                    value={newInterface.description}
                    onChange={(e) => setNewInterface({ ...newInterface, description: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#2E4A6F] rounded-lg text-white border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddInterface}
                    className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-lg hover:bg-[#10B981]/20"
                  >
                    添加
                  </button>
                  <button
                    onClick={() => setShowAddInterface(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {serviceInterfaces.map((intf) => (
                <div key={intf.id} className="flex items-center justify-between p-3 bg-[#1E3A5F] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      intf.method === 'GET' && 'bg-[#10B981]/20 text-[#10B981]',
                      intf.method === 'POST' && 'bg-[#00D9FF]/20 text-[#00D9FF]',
                      intf.method === 'PUT' && 'bg-[#F59E0B]/20 text-[#F59E0B]',
                      intf.method === 'DELETE' && 'bg-[#EF4444]/20 text-[#EF4444]',
                      intf.method === 'PATCH' && 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                    )}>
                      {intf.method}
                    </span>
                    <div>
                      <div className="text-sm text-white">{intf.name}</div>
                      <div className="text-xs text-gray-400">{intf.path}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteInterface(intf.id)}
                    className="p-1.5 rounded hover:bg-[#EF4444]/20 text-gray-400 hover:text-[#EF4444]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {serviceInterfaces.length === 0 && !showAddInterface && (
                <div className="text-sm text-gray-400 text-center py-4">暂无接口</div>
              )}
            </div>
          </div>

          {serviceChanges.length > 0 && (
            <div className="p-4 bg-[#2E4A6F]/50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#00D9FF]" />
                <span className="font-medium text-white">变更记录 ({serviceChanges.length})</span>
              </div>
              <div className="space-y-2">
                {serviceChanges.slice(0, 5).map((change) => (
                  <div key={change.id} className="p-3 bg-[#1E3A5F] rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{change.title}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(change.changeTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{change.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}