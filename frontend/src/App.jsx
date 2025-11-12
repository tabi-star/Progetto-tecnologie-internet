// src/App.jsx

import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import ScreeningSelection from './pages/ScreeningSelection'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import Login from './pages/Login'
import UserProfile from './pages/UserProfile'
import AdminDashboard from './pages/AdminDashboard'
import ManageMovies from './pages/admin/ManageMovies'
import ManageScreenings from './pages/admin/ManageScreenings'
import ManageHalls from './pages/admin/ManageHalls'
import AdminDiscounts from './pages/admin/AdminDiscounts'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import QRCodeScanner from './pages/QRCodeScanner'
import ProtectedRoute from './components/ProtectedRoute'
import './components/ProtectedRoute.css'
import ScrollToTop from './components/ScrollToTop'


function App() {
  return (
    <AuthProvider>

      <Layout>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/screening/:movieId" element={<ScreeningSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected routes (richiedono login) */}
          <Route path="/seats/:screeningId" element={
            <ProtectedRoute>
              <SeatSelection />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* Admin routes (richiedono login E ruolo admin) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/movies" element={
            <ProtectedRoute requireAdmin={true}>
              <ManageMovies />
            </ProtectedRoute>
          } />
          <Route path="/admin/screenings" element={
            <ProtectedRoute requireAdmin={true}>
              <ManageScreenings />
            </ProtectedRoute>
          } />
          <Route path="/admin/halls" element={
            <ProtectedRoute requireAdmin={true}>
              <ManageHalls />
            </ProtectedRoute>
          } />
          <Route path="/admin/discounts" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDiscounts />
            </ProtectedRoute>
          } />
          <Route path="/admin/qr-scanner" element={
            <ProtectedRoute requireAdmin={true}>
              <QRCodeScanner />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App