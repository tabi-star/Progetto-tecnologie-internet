// src/components/Layout.jsx

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, User, ArrowLeft, LogOut } from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              🎬 CinemaAPI
            </Link>
            
            <div className="header-actions">
              {!isHomePage && location.pathname !== '/' && (
                <button 
                  onClick={() => navigate(-1)}
                  className="btn-back"
                >
                  <ArrowLeft size={20} />
                  Torna indietro
                </button>
              )}
              
              <div className="user-menu">
                {user ? (
                  <div className="user-dropdown">
                    <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="user-link">
                      <User size={20} />
                      {user.name}
                    </Link>
                    <div className="dropdown-content">
                      <button onClick={handleLogout} className="dropdown-item">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="btn btn-secondary">
                    <User size={16} />
                    Accedi
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 CinemaAPI. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout