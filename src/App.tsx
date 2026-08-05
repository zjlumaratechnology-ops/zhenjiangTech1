import { Routes, Route } from 'react-router'
import { LanguageProvider } from './i18n/LanguageContext'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Study from './pages/Study'
import Sourcing from './pages/Sourcing'
import Visa from './pages/Visa'
import Living from './pages/Living'
import Community from './pages/Community'
import Events from './pages/Events'
import Ads from './pages/Ads'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study" element={<Study />} />
        <Route path="/sourcing" element={<Sourcing />} />
        <Route path="/visa" element={<Visa />} />
        <Route path="/living" element={<Living />} />
        <Route path="/community" element={<Community />} />
        <Route path="/events" element={<Events />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </LanguageProvider>
  )
}
