import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { 
  Server, 
  Plus, 
  Save, 
  Star, 
  ArrowLeft,
  Code,
  Link2,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { Service, ServiceInterface, ServiceRelation, ServiceStatus, Environment } from '@/types'
import clsx from 'clsx'

export function ServiceFormPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const addService = useServiceStore((state) => state.addService)
  const addInterface = useServiceStore((state) => state.addInterface)
  const addRelation = useServiceStore((state) => state.addRelation)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    environment: Environment.PRODUCTION,
    owner: '',
    status: ServiceStatus.NORMAL,
    isCore: false,
    description: ''
  })

  const [interfaces, setInterfaces] = useState<Omit<ServiceInterface, 'id' | 'serviceId'>[]>([])
  const [relations, setRelations] = useState<{ upstreamServiceId: string; callType: 'sync' | 'async' }[]>([])
  const [showRelationDropdown, setShowRelationDropdown] = useState(false)
  const [selectedUpstream, setSelectedUpstream] = useState('')

  const environments = [
    { value: Environment.DEVELOPMENT, label: '开发环境' },
    { value: Environment.TESTING, label: '测试环境' },
    { value: Environment.STAGING, label: '预发环境' },
    { value: Environment.PRODUCTION, label: '生产环境' }
  ]

  const statuses = [
    { value: ServiceStatus.NORMAL, label: '正常', color: '#10B981' },
    { value: ServiceStatus.WARNING, label: '警告', color: '#F59E0B' },
    { value: ServiceStatus.ERROR, label: '异常', color: '#EF4444' },
    { value: ServiceStatus.OFFLINE, label: '离线', color: '#6B7280' }
  ]

  const availableUpstreamServices = services.filter((s) => s.id !== formData.name)

  const handleAddInterface = () => {
    setInterfaces([...interfaces, {
      name: '',
      path: '',
      method: 'GET',
      description: ''
    }])
  }

  const handleUpdateInterface = (index: number, field: string, value: string) => {
    const updated = [...interfaces]
    updated[index] = { ...updated[index], [field]: value }
    setInterfaces(updated)
  }

  const handleRemoveInterface = (index: number) => {
    setInterfaces(interfaces.filter((_, i) => i !== index))
  }

  const handleAddRelation = () => {
    if (selectedUpstream) {
      setRelations([...relations, { upstreamServiceId: selectedUpstream, callType: 'sync' }])
      setSelectedUpstream('')
      setShowRelationDropdown(false)
    }
  }

  const handleUpdateRelationType = (index: number, type: 'sync' | 'async') => {
    const updated = [...relations]
    updated[index] = { ...updated[index], callType: type }
    setRelations(updated)
  }

  const handleRemoveRelation = (index: number) => {
    setRelations(relations.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.domain || !formData.owner) {
      alert('请填写必填字段：服务名称、业务域、负责人')
      return
    }

    const serviceId = `svc-${Date.now()}`
    const newService: Service = {
      id: serviceId,
      name: formData.name,
      domain: formData.domain,
      environment: formData.environment,
      owner: formData.owner,
      status: formData.status,
      isCore: formData.isCore,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addService(newService)

    interfaces.forEach((intf) => {
      if (intf.name && intf.path) {
        addInterface({
          id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          serviceId,
          ...intf
        })
      }
    })

    relations.forEach((rel) => {
      addRelation({
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        upstreamServiceId: rel.upstreamServiceId,
        downstreamServiceId: serviceId,
        callType: rel.callType,
        callFrequency: 100
      })
    })

    saveToStorage()
    navigate('/topology')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/topology')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回拓扑总览</span>
        </button>
      </div>

      <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] overflow-hidden">
        <div className="p-6 border-b border-[#2E4A6F]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00D9FF]/10 rounded-lg">
              <Plus className="w-6 h-6 text-[#00D9FF]" />
            </div>
            <div>
              <h2 
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                录入新服务
              </h2>
              <p className="text-sm text-gray-400">添加新的服务到拓扑图中，可同时配置接口和调用关系</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                服务名称 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="例如: user-service"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                业务域 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="例如: 用户中心"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                负责人 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="例如: 张三"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">环境</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as Environment })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none'
                )}
              >
                {environments.map((env) => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">状态</label>
              <div className="flex gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setFormData({ ...formData, status: status.value })}
                    className={clsx(
                      'flex-1 px-3 py-2 rounded-lg text-xs transition-all',
                      formData.status === status.value
                        ? `bg-[${status.color}]/20 text-[${status.color}] border border-[${status.color}]/50`
                        : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
                    )}
                    style={{
                      backgroundColor: formData.status === status.value ? `${status.color}20` : undefined,
                      color: formData.status === status.value ? status.color : undefined,
                      borderColor: formData.status === status.value ? `${status.color}50` : undefined
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">核心服务</label>
              <button
                onClick={() => setFormData({ ...formData, isCore: !formData.isCore })}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all',
                  formData.isCore
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50'
                    : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
                )}
              >
                <Star className={clsx('w-4 h-4', formData.isCore && 'fill-current')} />
                {formData.isCore ? '是' : '否'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">描述</label>
            <textarea
              placeholder="服务功能描述..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={clsx(
                'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white resize-none',
                'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                'placeholder-gray-500'
              )}
              rows={3}
            />
          </div>

          <div className="border-t border-[#2E4A6F] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00D9FF]" />
                <span className="font-medium text-white">接口配置</span>
              </div>
              <button
                onClick={handleAddInterface}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20"
              >
                <Plus className="w-3 h-3" />
                新增接口
              </button>
            </div>

            <div className="space-y-3">
              {interfaces.map((intf, index) => (
                <div key={index} className="flex gap-3 p-3 bg-[#2E4A6F]/50 rounded-lg">
                  <select
                    value={intf.method}
                    onChange={(e) => handleUpdateInterface(index, 'method', e.target.value)}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium',
                      intf.method === 'GET' && 'bg-[#10B981]/20 text-[#10B981]',
                      intf.method === 'POST' && 'bg-[#00D9FF]/20 text-[#00D9FF]',
                      intf.method === 'PUT' && 'bg-[#F59E0B]/20 text-[#F59E0B]',
                      intf.method === 'DELETE' && 'bg-[#EF4444]/20 text-[#EF4444]',
                      intf.method === 'PATCH' && 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                    )}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  <input
                    type="text"
                    placeholder="接口名称"
                    value={intf.name}
                    onChange={(e) => handleUpdateInterface(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-transparent focus:border-[#00D9FF] focus:outline-none placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="/api/path"
                    value={intf.path}
                    onChange={(e) => handleUpdateInterface(index, 'path', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#1E3A5F] rounded-lg text-white border border-transparent focus:border-[#00D9FF] focus:outline-none placeholder-gray-500"
                  />
                  <button
                    onClick={() => handleRemoveInterface(index)}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {interfaces.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400">暂无接口配置</div>
              )}
            </div>
          </div>

          <div className="border-t border-[#2E4A6F] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#00D9FF]" />
                <span className="font-medium text-white">调用关系（上游服务）</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowRelationDropdown(!showRelationDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20"
                >
                  <Plus className="w-3 h-3" />
                  添加上游依赖
                  <ChevronDown className={clsx('w-3 h-3', showRelationDropdown && 'rotate-180')} />
                </button>
                {showRelationDropdown && availableUpstreamServices.length > 0 && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1E3A5F] border border-[#2E4A6F] rounded-lg overflow-hidden z-10">
                    <input
                      type="text"
                      placeholder="搜索服务..."
                      value={selectedUpstream}
                      onChange={(e) => setSelectedUpstream(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2E4A6F]/50 text-white border-b border-[#2E4A6F] placeholder-gray-500 focus:outline-none"
                    />
                    {availableUpstreamServices.filter((s) => 
                      s.name.toLowerCase().includes(selectedUpstream.toLowerCase())
                    ).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedUpstream(service.id)
                          handleAddRelation()
                        }}
                        className="w-full px-3 py-2 text-left text-white hover:bg-[#2E4A6F] flex items-center gap-2"
                      >
                        <Server className="w-3 h-3" />
                        {service.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {relations.map((rel, index) => {
                const upstreamService = services.find((s) => s.id === rel.upstreamServiceId)
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#2E4A6F]/50 rounded-lg">
                    <Server className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-white">{upstreamService?.name || '未知服务'}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateRelationType(index, 'sync')}
                        className={clsx(
                          'px-2 py-1 rounded text-xs',
                          rel.callType === 'sync'
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : 'bg-[#2E4A6F] text-gray-400'
                        )}
                      >
                        同步
                      </button>
                      <button
                        onClick={() => handleUpdateRelationType(index, 'async')}
                        className={clsx(
                          'px-2 py-1 rounded text-xs',
                          rel.callType === 'async'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : 'bg-[#2E4A6F] text-gray-400'
                        )}
                      >
                        异步
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveRelation(index)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
              {relations.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400">暂无上游依赖</div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-[#2E4A6F]">
            <button
              onClick={handleSubmit}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 rounded-lg',
                'bg-[#00D9FF] text-[#0A1628] font-medium',
                'hover:bg-[#00D9FF]/80 transition-colors'
              )}
            >
              <Save className="w-4 h-4" />
              保存服务
            </button>
            <button
              onClick={() => navigate('/topology')}
              className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}