import { useEffect } from 'react'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { initializeMockData } from '@/services/mockDataService'

export function useInitializeData() {
  const services = useServiceStore((state) => state.services)
  const loadFromStorage = useServiceStore((state) => state.loadFromStorage)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)

  useEffect(() => {
    const storedData = localStorage.getItem('service-topology-data')
    const storedAlerts = localStorage.getItem('service-topology-alerts')
    
    if (!storedData || (JSON.parse(storedData).services?.length === 0)) {
      const mockData = initializeMockData()
      useServiceStore.setState({
        services: mockData.services,
        interfaces: mockData.interfaces,
        relations: mockData.relations,
        changeRecords: mockData.changeRecords
      })
      useAlertStore.getState().addAlert = () => {}
      useAlertStore.setState({ alerts: mockData.alerts })
      saveToStorage()
      useAlertStore.getState().saveToStorage()
    } else {
      loadFromStorage()
      useAlertStore.getState().loadFromStorage()
    }
  }, [])

  useEffect(() => {
    if (services.length > 0) {
      saveToStorage()
      useAlertStore.getState().saveToStorage()
    }
  }, [services, saveToStorage])

  return { initialized: services.length > 0 }
}