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

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/screening/:movieId" element={<ScreeningSelection />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/seats/:screeningId" element={<SeatSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<UserProfile />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/movies" element={<ManageMovies />} />
          <Route path="/admin/screenings" element={<ManageScreenings />} />
          <Route path="/admin/halls" element={<ManageHalls />} />
          <Route path="/admin/discounts" element={<AdminDiscounts />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App