import { create } from 'zustand'
import { Alert, AlertLevel } from '@/types'

interface AlertState {
  alerts: Alert[]
  selectedAlertId: string | null
  filterLevel: AlertLevel | null
  showResolved: boolean
  
  addAlert: (alert: Alert) => void
  resolveAlert: (id: string) => void
  selectAlert: (id: string | null) => void
  setFilterLevel: (level: AlertLevel | null) => void
  setShowResolved: (show: boolean) => void
  loadFromStorage: () => void
  saveToStorage: () => void
  getFilteredAlerts: () => Alert[]
  getUnresolvedCount: () => number
  getCriticalCount: () => number
}

const STORAGE_KEY = 'service-topology-alerts'

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  selectedAlertId: null,
  filterLevel: null,
  showResolved: false,
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, alert]
  })),
  
  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) => 
      a.id === id ? { ...a, isResolved: true } : a
    )
  })),
  
  selectAlert: (id) => set({ selectedAlertId: id }),
  
  setFilterLevel: (level) => set({ filterLevel: level }),
  
  setShowResolved: (show) => set({ showResolved: show }),
  
  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        set({ alerts: data.alerts || [] })
      } catch (e) {
        console.error('Failed to load alerts from storage:', e)
      }
    }
  },
  
  saveToStorage: () => {
    const state = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      alerts: state.alerts
    }))
  },
  
  getFilteredAlerts: () => {
    const state = get()
    let filtered = state.alerts
    
    if (!state.showResolved) {
      filtered = filtered.filter((a) => !a.isResolved)
    }
    
    if (state.filterLevel) {
      filtered = filtered.filter((a) => a.level === state.filterLevel)
    }
    
    return filtered.sort((a, b) => {
      const levelOrder = { critical: 0, error: 1, warning: 2, info: 3 }
      return levelOrder[a.level] - levelOrder[b.level]
    })
  },
  
  getUnresolvedCount: () => {
    const state = get()
    return state.alerts.filter((a) => !a.isResolved).length
  },
  
  getCriticalCount: () => {
    const state = get()
    return state.alerts.filter((a) => 
      !a.isResolved && (a.level === 'critical' || a.level === 'error')
    ).length
  }
}))