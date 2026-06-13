import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { 
  Server, 
  Plus, 
  Save, 
  Star,
  ArrowLeft
} from 'lucide-react'
import { Service, ServiceStatus, Environment } from '@/types'
import clsx from 'clsx'

export function ServiceFormPage() {
  const navigate = useNavigate()
  const addService = useServiceStore((state) => state.addService)
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

  const handleSubmit = () => {
    if (!formData.name || !formData.domain || !formData.owner) {
      alert('请填写必填字段：服务名称、业务域、负责人')
      return
    }

    const newService: Service = {
      id: `svc-${Date.now()}`,
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
    saveToStorage()
    navigate('/topology')
  }

  return (
    <div className="max-w-2xl mx-auto">
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
              <p className="text-sm text-gray-400">添加新的服务到拓扑图中</p>
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
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-[#2E4A6F]">
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