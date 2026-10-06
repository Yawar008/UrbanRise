import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GlobalLoader from './components/GlobalLoader'
import { LoaderProvider } from './context/LoaderContext'
import Dashboard from './pages/Dashboard'

export default function Router() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <GlobalLoader />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </LoaderProvider>
    </BrowserRouter>
  )
}
