import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './layout/Layout'
import { AboutPage } from './pages/About'
import { CabinetPage } from './pages/Cabinet'
import { ContactsPage } from './pages/Contacts'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { NewRequestPage } from './pages/NewRequest'
import { RegisterPage } from './pages/Register'
import { ServicesPage } from './pages/Services'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="cabinet" element={<CabinetPage />} />
            <Route path="cabinet/requests/new" element={<NewRequestPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
