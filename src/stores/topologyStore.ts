import { create } from 'zustand'

interface TopologyState {
  zoom: number
  highlightedNodes: string[]
  selectedNodeId: string | null
  showDetailPanel: boolean
  
  setZoom: (zoom: number) => void
  highlightNodes: (ids: string[]) => void
  clearHighlight: () => void
  selectNode: (id: string | null) => void
  setShowDetailPanel: (show: boolean) => void
  highlightUpstream: (serviceId: string, upstreamIds: string[]) => void
  highlightDownstream: (serviceId: string, downstreamIds: string[]) => void
}

export const useTopologyStore = create<TopologyState>((set) => ({
  zoom: 1,
  highlightedNodes: [],
  selectedNodeId: null,
  showDetailPanel: false,
  
  setZoom: (zoom) => set({ zoom }),
  
  highlightNodes: (ids) => set({ highlightedNodes: ids }),
  
  clearHighlight: () => set({ highlightedNodes: [] }),
  
  selectNode: (id) => set({ 
    selectedNodeId: id,
    showDetailPanel: id !== null
  }),
  
  setShowDetailPanel: (show) => set({ showDetailPanel: show }),
  
  highlightUpstream: (serviceId, upstreamIds) => set({
    highlightedNodes: [serviceId, ...upstreamIds]
  }),
  
  highlightDownstream: (serviceId, downstreamIds) => set({
    highlightedNodes: [serviceId, ...downstreamIds]
  })
}))