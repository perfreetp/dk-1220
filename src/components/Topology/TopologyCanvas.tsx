import { useCallback, useEffect, useMemo } from 'react'
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background, 
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel
} from '@xyflow/react'
import dagre from 'dagre'
import { useServiceStore } from '@/stores/serviceStore'
import { useTopologyStore } from '@/stores/topologyStore'
import { Service, ServiceRelation } from '@/types'
import ServiceNode from './ServiceNode'
import DependencyEdge from './DependencyEdge'
import clsx from 'clsx'
import '@xyflow/react/dist/style.css'

const nodeTypes = { service: ServiceNode }
const edgeTypes = { dependency: DependencyEdge }

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150, marginx: 50, marginy: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 40
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

interface TopologyCanvasProps {
  onNodeClick?: (serviceId: string) => void
}

export function TopologyCanvas({ onNodeClick }: TopologyCanvasProps) {
  const services = useServiceStore((state) => state.getFilteredServices())
  const relations = useServiceStore((state) => state.relations)
  const selectedNodeId = useTopologyStore((state) => state.selectedNodeId)
  const highlightedNodes = useTopologyStore((state) => state.highlightedNodes)
  const selectNode = useTopologyStore((state) => state.selectNode)

  const initialNodes: Node[] = useMemo(() => {
    return services.map((service: Service) => ({
      id: service.id,
      type: 'service',
      data: service,
      position: { x: 0, y: 0 }
    }))
  }, [services])

  const initialEdges: Edge[] = useMemo(() => {
    const filteredServiceIds = services.map((s) => s.id)
    return relations
      .filter((r: ServiceRelation) => 
        filteredServiceIds.includes(r.upstreamServiceId) && 
        filteredServiceIds.includes(r.downstreamServiceId)
      )
      .map((relation: ServiceRelation) => ({
        id: relation.id,
        source: relation.upstreamServiceId,
        target: relation.downstreamServiceId,
        type: 'dependency',
        data: relation
      }))
  }, [relations, services])

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges)
  }, [initialNodes, initialEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: highlightedNodes.includes(node.id)
        },
        selected: node.id === selectedNodeId
      }))
    )
  }, [highlightedNodes, selectedNodeId, setNodes])

  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    selectNode(node.id)
    if (onNodeClick) {
      onNodeClick(node.id)
    }
  }, [selectNode, onNodeClick])

  return (
    <div className="w-full h-[calc(100vh-8rem)] bg-[#0A1628] rounded-xl border border-[#1E3A5F] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: false
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#1E3A5F"
        />
        <Controls 
          className={clsx(
            'bg-[#1E3A5F] border border-[#2E4A6F] rounded-lg',
            '[&>button]:bg-[#1E3A5F] [&>button]:border-[#2E4A6F]',
            '[&>button]:text-gray-400 [&>button:hover]:text-white [&>button:hover]:bg-[#2E4A6F]'
          )}
        />
        <Panel position="top-left" className="ml-2 mt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1E3A5F]/80 rounded-lg border border-[#2E4A6F] text-xs text-gray-400">
            <span>节点: {services.length}</span>
            <span className="text-[#2E4A6F]">|</span>
            <span>连线: {edges.length}</span>
          </div>
        </Panel>
      </ReactFlow>
      
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.8" />
          </linearGradient>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 L3,5 Z" fill="#00D9FF" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}