import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Film, Calendar, Building, Ticket, Settings, Users } from 'lucide-react'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()

  if (!user || user.role !== 'admin') {
    return (
      <div className="error">
        Accesso negato. Solo gli amministratori possono accedere a questa pagina.
      </div>
    )
  }

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
      color: '#9b59b6'
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
      title: 'Gestisci Utenti',
      description: 'Visualizza e gestisci gli utenti registrati',
      link: '/admin/users',
      color: '#2ecc71'
    },
    {
      icon: <Settings size={32} />,
      title: 'Impostazioni',
      description: 'Configura le impostazioni del sistema',
      link: '/admin/settings',
      color: '#95a5a6'
    }
  ]

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <div className="admin-welcome">
            <h1>Ciao, Amministratore {user.name}!</h1>
            <p>Gestisci il cinema dalla tua dashboard personale</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <Film size={24} />
              <div className="stat-info">
                <span className="stat-number">12</span>
                <span className="stat-label">Film attivi</span>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={24} />
              <div className="stat-info">
                <span className="stat-number">24</span>
                <span className="stat-label">Proiezioni oggi</span>
              </div>
            </div>
            <div className="stat-card">
              <Ticket size={24} />
              <div className="stat-info">
                <span className="stat-number">156</span>
                <span className="stat-label">Biglietti venduti</span>
              </div>
            </div>
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

        <div className="admin-quick-actions">
          <h3>Azioni Rapide</h3>
          <div className="quick-actions-grid">
            <button className="quick-action">
              <Film size={20} />
              <span>Aggiungi Film</span>
            </button>
            <button className="quick-action">
              <Calendar size={20} />
              <span>Nuova Proiezione</span>
            </button>
            <button className="quick-action">
              <Ticket size={20} />
              <span>Genera Codice Sconto</span>
            </button>
            <button className="quick-action">
              <Users size={20} />
              <span>Visualizza Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard