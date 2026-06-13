import { useEffect } from 'react'
import { useServiceStore } from '@/stores/serviceStore'
import { useAlertStore } from '@/stores/alertStore'
import { initializeMockData } from '@/services/mockDataService'

export function useInitializeData() {
  const services = useServiceStore((state) => state.services)
  const changeRecords = useServiceStore((state) => state.changeRecords)
  const loadFromStorage = useServiceStore((state) => state.loadFromStorage)
  const saveToStorage = useServiceStore((state) => state.saveToStorage)
  
  useEffect(() => {
    const storedData = localStorage.getItem('service-topology-data')
    const storedAlerts = localStorage.getItem('service-topology-alerts')
    
    const hasServiceData = storedData && JSON.parse(storedData).services?.length > 0
    const hasAlertData = storedAlerts && JSON.parse(storedAlerts).alerts?.length > 0
    
    if (!hasServiceData || !hasAlertData) {
      const mockData = initializeMockData()
      useServiceStore.setState({
        services: mockData.services,
        interfaces: mockData.interfaces,
        relations: mockData.relations,
        changeRecords: mockData.changeRecords
      })
      useAlertStore.setState({ alerts: mockData.alerts })
      saveToStorage()
      useAlertStore.getState().saveToStorage()
    } else {
      loadFromStorage()
      useAlertStore.getState().loadFromStorage()
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage()
      useAlertStore.getState().saveToStorage()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveToStorage])

  return { services, changeRecords }
}