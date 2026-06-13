import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react'
import { memo } from 'react'
import clsx from 'clsx'

function DependencyEdge({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition,
  data,
  selected
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const edgeData = data as { callType?: string; callFrequency?: number } | undefined
  const callFrequency = edgeData?.callFrequency || 100
  const strokeWidth = Math.max(1, Math.min(4, callFrequency / 200))
  const isAsync = edgeData?.callType === 'async'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={clsx(
          'transition-all duration-300',
          selected ? 'stroke-[#00D9FF]' : 'stroke-[#00D9FF]/40'
        )}
        style={{
          strokeWidth: strokeWidth,
          strokeDasharray: isAsync ? '5,5' : undefined
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="url(#edge-gradient)"
        className={clsx(
          'transition-all duration-300',
          selected && 'stroke-[#00D9FF]'
        )}
        markerEnd="url(#arrow)"
      />
      
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -20;
            }
          }
        `}
      </style>
      
      <path
        d={edgePath}
        fill="none"
        strokeWidth={strokeWidth + 1}
        stroke="transparent"
        className="cursor-pointer hover:stroke-[#00D9FF]/20"
        style={{
          strokeDasharray: isAsync ? '5,5' : undefined,
          animation: isAsync ? 'dash 1s linear infinite' : undefined
        }}
      />
    </>
  )
}

export default memo(DependencyEdge)