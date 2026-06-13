import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Server, Star, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { Service, STATUS_COLORS, STATUS_LABELS } from '@/types'
import { useTopologyStore } from '@/stores/topologyStore'
import clsx from 'clsx'

interface ServiceNodeData extends Service {
  isHighlighted?: boolean
}

function ServiceNode({ data, selected }: NodeProps) {
  const serviceData = data as unknown as ServiceNodeData
  const highlightedNodes = useTopologyStore((state) => state.highlightedNodes)
  const selectNode = useTopologyStore((state) => state.selectNode)
  
  const isHighlighted = highlightedNodes.includes(serviceData.id)
  const statusColor = STATUS_COLORS[serviceData.status]
  const isOffline = serviceData.status === 'offline'
  const hasError = serviceData.status === 'error' || serviceData.status === 'warning'

  return (
    <div
      className={clsx(
        'relative group cursor-pointer transition-all duration-300',
        isHighlighted && 'scale-110',
        selected && 'ring-2 ring-[#00D9FF] ring-offset-2 ring-offset-[#0A1628]'
      )}
      onClick={() => selectNode(serviceData.id)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-[#00D9FF] border-2 border-[#0A1628] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <div
        className={clsx(
          'px-4 py-3 rounded-xl border-2 min-w-[180px]',
          'bg-[#1E3A5F] backdrop-blur-sm',
          'shadow-lg shadow-black/20',
          isHighlighted 
            ? 'border-[#00D9FF] shadow-[#00D9FF]/20' 
            : 'border-[#2E4A6F]',
          hasError && !isHighlighted && 'animate-pulse',
          'transition-all duration-300 hover:border-[#00D9FF]/50 hover:shadow-[#00D9FF]/10'
        )}
        style={{
          borderColor: isHighlighted ? '#00D9FF' : serviceData.isCore ? `${statusColor}40` : undefined
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className={clsx(
              'p-2 rounded-lg',
              isOffline ? 'bg-gray-500/20' : 'bg-[#00D9FF]/10'
            )}
          >
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Server className="w-4 h-4 text-[#00D9FF]" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold text-white truncate"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {serviceData.name}
              </span>
              {serviceData.isCore && (
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
              )}
            </div>
            <div className="text-xs text-gray-400 truncate mt-0.5">
              {serviceData.domain}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#2E4A6F]/50">
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
            style={{ 
              backgroundColor: `${statusColor}20`,
              color: statusColor
            }}
          >
            {hasError && <AlertTriangle className="w-3 h-3" />}
            <span>{STATUS_LABELS[serviceData.status]}</span>
          </div>
          <div className="text-xs text-gray-500">
            {serviceData.owner}
          </div>
        </div>

        {isHighlighted && (
          <div className="absolute -inset-1 rounded-xl border border-[#00D9FF]/30 animate-pulse pointer-events-none" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-[#00D9FF] border-2 border-[#0A1628] opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  )
}

export default memo(ServiceNode)