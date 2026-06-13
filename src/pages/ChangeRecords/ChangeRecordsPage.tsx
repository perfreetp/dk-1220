import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@/stores/serviceStore'
import { 
  History, 
  Plus, 
  Clock,
  Server,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  FileText
} from 'lucide-react'
import { ChangeRecord, ChangeType, CHANGE_TYPE_LABELS } from '@/types'
import clsx from 'clsx'

export function ChangeRecordsPage() {
  const navigate = useNavigate()
  const services = useServiceStore((state) => state.services)
  const changeRecords = useServiceStore((state) => state.changeRecords)
  const addChangeRecord = useServiceStore((state) => state.addChangeRecord)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)

  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<ChangeType | null>(null)
  const [newRecord, setNewRecord] = useState({
    serviceId: '',
    title: '',
    content: '',
    operator: '',
    changeType: ChangeType.DEPLOY
  })

  const filteredRecords = useMemo(() => {
    let records = changeRecords
    if (filterType) {
      records = records.filter((r) => r.changeType === filterType)
    }
    return records.sort((a, b) => 
      new Date(b.changeTime).getTime() - new Date(a.changeTime).getTime()
    )
  }, [changeRecords, filterType])

  const groupedRecords = useMemo(() => {
    const groups: Record<string, ChangeRecord[]> = {}
    filteredRecords.forEach((record) => {
      const date = new Date(record.changeTime).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(record)
    })
    return groups
  }, [filteredRecords])

  const changeTypes = [
    { value: ChangeType.DEPLOY, label: '发布部署', color: '#00D9FF' },
    { value: ChangeType.CONFIG, label: '配置变更', color: '#F59E0B' },
    { value: ChangeType.SCALE, label: '扩缩容', color: '#10B981' },
    { value: ChangeType.ROLLBACK, label: '回滚', color: '#EF4444' }
  ]

  const toggleExpand = (id: string) => {
    setExpandedRecords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAddRecord = () => {
    if (!newRecord.serviceId || !newRecord.title || !newRecord.operator) {
      alert('请填写必填字段')
      return
    }

    addChangeRecord({
      id: `chg-${Date.now()}`,
      serviceId: newRecord.serviceId,
      title: newRecord.title,
      content: newRecord.content,
      operator: newRecord.operator,
      changeType: newRecord.changeType,
      changeTime: new Date().toISOString()
    })
    saveToStorage()
    setNewRecord({
      serviceId: '',
      title: '',
      content: '',
      operator: '',
      changeType: ChangeType.DEPLOY
    })
    setShowAddForm(false)
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || '未知服务'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-xl font-semibold text-white mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            变更记录
          </h2>
          <p className="text-sm text-gray-400">查看和管理服务发布变更历史</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
            'hover:bg-[#00D9FF]/20 transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          新增记录
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#1E3A5F]/50 rounded-xl border border-[#00D9FF]/30 p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">新增变更记录</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2">服务</label>
                <select
                  value={newRecord.serviceId}
                  onChange={(e) => setNewRecord({ ...newRecord, serviceId: e.target.value })}
                  className={clsx(
                    'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                    'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none'
                  )}
                >
                  <option value="">选择服务...</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">变更类型</label>
                <select
                  value={newRecord.changeType}
                  onChange={(e) => setNewRecord({ ...newRecord, changeType: e.target.value as ChangeType })}
                  className={clsx(
                    'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                    'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none'
                  )}
                >
                  {changeTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">标题</label>
              <input
                type="text"
                placeholder="变更标题..."
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">操作人</label>
              <input
                type="text"
                placeholder="操作人姓名..."
                value={newRecord.operator}
                onChange={(e) => setNewRecord({ ...newRecord, operator: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">变更内容</label>
              <textarea
                placeholder="详细描述变更内容..."
                value={newRecord.content}
                onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
                className={clsx(
                  'w-full px-4 py-3 bg-[#2E4A6F]/50 rounded-lg text-white resize-none',
                  'border border-[#2E4A6F] focus:border-[#00D9FF] focus:outline-none',
                  'placeholder-gray-500'
                )}
                rows={4}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddRecord}
                className={clsx(
                  'px-6 py-3 rounded-lg',
                  'bg-[#00D9FF] text-[#0A1628] font-medium',
                  'hover:bg-[#00D9FF]/80 transition-colors'
                )}
              >
                保存记录
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterType(null)}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            !filterType
              ? 'bg-[#00D9FF] text-[#0A1628] font-medium'
              : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
          )}
        >
          全部 ({changeRecords.length})
        </button>
        {changeTypes.map((type) => {
          const count = changeRecords.filter((r) => r.changeType === type.value).length
          return (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                filterType === type.value
                  ? `bg-[${type.color}]/20 text-[${type.color}] border border-[${type.color}]/50`
                  : 'bg-[#2E4A6F] text-gray-400 hover:text-white'
              )}
              style={{
                backgroundColor: filterType === type.value ? `${type.color}20` : undefined,
                color: filterType === type.value ? type.color : undefined,
                borderColor: filterType === type.value ? `${type.color}50` : undefined
              }}
            >
              {type.label} ({count})
            </button>
          )
        })}
      </div>

      {Object.entries(groupedRecords).map(([date, records]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{date}</span>
          </div>
          <div className="space-y-3">
            {records.map((record) => {
              const typeConfig = changeTypes.find((t) => t.value === record.changeType)
              const isExpanded = expandedRecords.has(record.id)

              return (
                <div 
                  key={record.id}
                  className="bg-[#1E3A5F]/50 rounded-xl border border-[#2E4A6F] overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-[#2E4A6F]/30 transition-colors"
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${typeConfig?.color}20` }}
                        >
                          <History className="w-4 h-4" style={{ color: typeConfig?.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{record.title}</span>
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${typeConfig?.color}20`,
                                color: typeConfig?.color
                              }}
                            >
                              {CHANGE_TYPE_LABELS[record.changeType]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              <span>{getServiceName(record.serviceId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{record.operator}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(record.changeTime).toLocaleTimeString()}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#2E4A6F]">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-300">{record.content || '暂无详细内容'}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/service/${record.serviceId}`)}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20"
                      >
                        查看服务详情
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">暂无变更记录</p>
        </div>
      )}
    </div>
  )
}