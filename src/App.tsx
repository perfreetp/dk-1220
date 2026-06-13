import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { TopologyPage } from '@/pages/Topology/TopologyPage'
import { ServiceDetailPage } from '@/pages/ServiceDetail/ServiceDetailPage'
import { ServiceFormPage } from '@/pages/ServiceForm/ServiceFormPage'
import { LinkQueryPage } from '@/pages/LinkQuery/LinkQueryPage'
import { ChangeRecordsPage } from '@/pages/ChangeRecords/ChangeRecordsPage'
import { AlertsPage } from '@/pages/Alerts/AlertsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TopologyPage />} />
          <Route path="topology" element={<TopologyPage />} />
          <Route path="service/:id" element={<ServiceDetailPage />} />
          <Route path="service/new" element={<ServiceFormPage />} />
          <Route path="link-query" element={<LinkQueryPage />} />
          <Route path="change-records" element={<ChangeRecordsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}