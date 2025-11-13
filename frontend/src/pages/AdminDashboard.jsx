// src/pages/AdminDashboard.jsx

import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Film, Calendar, Building, Ticket, Settings, Users, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeMovies: 0,
    todayScreenings: 0,
    soldTickets: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  if (!user || user.role !== 'admin') {
    return (
      <div className="error">
        Accesso negato. Solo gli amministratori possono accedere a questa pagina.
      </div>
    )
  }

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await axios.get('/api/stats/dashboard')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('❌ Errore caricamento statistiche:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const adminFeatures = [
    {
      icon: <Film size={32} />,
      title: 'Gestisci Film',
      description: 'Aggiungi, modifica o elimina film dalla programmazione',
      link: '/admin/movies',
      color: '#e74c3c'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Gestisci Proiezioni',
      description: 'Programma le proiezioni e gestisci gli orari',
      link: '/admin/screenings',
      color: '#3498db'
    },
    {
      icon: <Building size={32} />,
      title: 'Gestisci Sale',
      description: 'Configura le sale e i posti disponibili',
      link: '/admin/halls',
      color: '#2ecc71'
    },
    {
      icon: <Ticket size={32} />,
      title: 'Codici Sconto',
      description: 'Genera e gestisci i codici sconto dipendenti',
      link: '/admin/discounts',
      color: '#f1c40f'
    },
    {
      icon: <Users size={32} />,
      title: 'Scansiona biglietti',
      description: 'Verifica e convalida i biglietti con QR code',
      link: '/admin/qr-scanner',
      color: '#7a68c9' /*'#9b59b6'*/
    },
    {
      icon: <Settings size={32} />,
      title: 'Dati e biglietti',
      description: 'Consulta biglietti prenotati',
      link: '/profile',
      color: '#95a5a6'
    }
  ]

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <div className="admin-welcome">
            <h1>Ciao, collega {user.name}!</h1>
            <p>Gestisci il cinema dalla tua dashboard personale</p>
          </div>
          
          <div className="admin-stats-header">
            <h2>Statistiche in Tempo Reale</h2>
          </div>

          <div className="admin-stats-body">
            <div className="admin-stats">
              <div className="stat-card">
                <Film size={24} />
                <div className="stat-info">
                  {loading ? (
                    <div className="stat-loading">...</div>
                  ) : (
                    <>
                      <span className="stat-number">{stats.activeMovies}</span>
                      <span className="stat-label">Film attivi</span>
                    </>
                  )}
                </div>
              </div>
            
              <div className="stat-card">
                <Calendar size={24} />
                <div className="stat-info">
                  {loading ? (
                    <div className="stat-loading">...</div>
                  ) : (
                    <>
                      <span className="stat-number">{stats.todayScreenings}</span>
                      <span className="stat-label">Proiezioni oggi</span>
                    </>
                  )}
                </div>
              </div>
            
              <div className="stat-card">
                <Ticket size={24} />
                <div className="stat-info">
                  {loading ? (
                    <div className="stat-loading">...</div>
                  ) : (
                    <>
                      <span className="stat-number">{stats.soldTickets}</span>
                      <span className="stat-label">Biglietti venduti</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="refresh-btn"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'refreshing' : ''} />
              {refreshing ? 'Aggiornamento...' : 'Aggiorna'}
            </button>
          </div>
        </div>

        <div className="admin-features">
          <h2>Pannello di Controllo</h2>
          <div className="features-grid">
            {adminFeatures.map((feature, index) => (
              <Link key={index} to={feature.link} className="feature-card">
                <div 
                  className="feature-icon"
                  style={{ backgroundColor: feature.color }}
                >
                  {feature.icon}
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="feature-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard