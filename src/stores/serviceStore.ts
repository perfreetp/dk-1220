import { create } from 'zustand'
import { Service, ServiceInterface, ServiceRelation, ChangeRecord, Environment } from '@/types'

interface ServiceState {
  services: Service[]
  interfaces: ServiceInterface[]
  relations: ServiceRelation[]
  changeRecords: ChangeRecord[]
  selectedServiceId: string | null
  filterDomain: string | null
  filterEnv: Environment | null
  searchQuery: string
  
  addService: (service: Service) => void
  updateService: (id: string, data: Partial<Service>) => void
  deleteService: (id: string) => void
  addInterface: (interfaceData: ServiceInterface) => void
  updateInterface: (id: string, data: Partial<ServiceInterface>) => void
  deleteInterface: (id: string) => void
  addRelation: (relation: ServiceRelation) => void
  deleteRelation: (id: string) => void
  addChangeRecord: (record: ChangeRecord) => void
  selectService: (id: string | null) => void
  setFilterDomain: (domain: string | null) => void
  setFilterEnv: (env: Environment | null) => void
  setSearchQuery: (query: string) => void
  loadFromStorage: () => void
  saveToStorage: () => void
  getFilteredServices: () => Service[]
  getUpstreamServices: (serviceId: string) => Service[]
  getDownstreamServices: (serviceId: string) => Service[]
  getServiceInterfaces: (serviceId: string) => ServiceInterface[]
}

const STORAGE_KEY = 'service-topology-data'

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  interfaces: [],
  relations: [],
  changeRecords: [],
  selectedServiceId: null,
  filterDomain: null,
  filterEnv: null,
  searchQuery: '',
  
  addService: (service) => set((state) => ({
    services: [...state.services, service]
  })),
  
  updateService: (id, data) => set((state) => ({
    services: state.services.map((s) => 
      s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
    )
  })),
  
  deleteService: (id) => set((state) => ({
    services: state.services.filter((s) => s.id !== id),
    interfaces: state.interfaces.filter((i) => i.serviceId !== id),
    relations: state.relations.filter((r) => 
      r.upstreamServiceId !== id && r.downstreamServiceId !== id
    ),
    changeRecords: state.changeRecords.filter((c) => c.serviceId !== id)
  })),
  
  addInterface: (interfaceData) => set((state) => ({
    interfaces: [...state.interfaces, interfaceData]
  })),
  
  updateInterface: (id, data) => set((state) => ({
    interfaces: state.interfaces.map((i) => 
      i.id === id ? { ...i, ...data } : i
    )
  })),
  
  deleteInterface: (id) => set((state) => ({
    interfaces: state.interfaces.filter((i) => i.id !== id)
  })),
  
  addRelation: (relation) => set((state) => ({
    relations: [...state.relations, relation]
  })),
  
  deleteRelation: (id) => set((state) => ({
    relations: state.relations.filter((r) => r.id !== id)
  })),
  
  addChangeRecord: (record) => set((state) => ({
    changeRecords: [...state.changeRecords, record]
  })),
  
  selectService: (id) => set({ selectedServiceId: id }),
  
  setFilterDomain: (domain) => set({ filterDomain: domain }),
  
  setFilterEnv: (env) => set({ filterEnv: env }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        set({
          services: data.services || [],
          interfaces: data.interfaces || [],
          relations: data.relations || [],
          changeRecords: data.changeRecords || []
        })
      } catch (e) {
        console.error('Failed to load from storage:', e)
      }
    }
  },
  
  saveToStorage: () => {
    const state = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      services: state.services,
      interfaces: state.interfaces,
      relations: state.relations,
      changeRecords: state.changeRecords
    }))
  },
  
  getFilteredServices: () => {
    const state = get()
    let filtered = state.services
    
    if (state.filterDomain) {
      filtered = filtered.filter((s) => s.domain === state.filterDomain)
    }
    
    if (state.filterEnv) {
      filtered = filtered.filter((s) => s.environment === state.filterEnv)
    }
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter((s) => 
        s.name.toLowerCase().includes(query) ||
        s.owner.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      )
    }
    
    return filtered
  },
  
  getUpstreamServices: (serviceId) => {
    const state = get()
    const upstreamIds = state.relations
      .filter((r) => r.downstreamServiceId === serviceId)
      .map((r) => r.upstreamServiceId)
    return state.services.filter((s) => upstreamIds.includes(s.id))
  },
  
  getDownstreamServices: (serviceId) => {
    const state = get()
    const downstreamIds = state.relations
      .filter((r) => r.upstreamServiceId === serviceId)
      .map((r) => r.downstreamServiceId)
    return state.services.filter((s) => downstreamIds.includes(s.id))
  },
  
  getServiceInterfaces: (serviceId) => {
    const state = get()
    return state.interfaces.filter((i) => i.serviceId === serviceId)
  }
}))