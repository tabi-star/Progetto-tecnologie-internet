import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import axios from 'axios'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/users/forgot-password', { email })
      
      if (response.data.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel recupero password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="success-message">
            <CheckCircle size={64} className="success-icon" />
            <h1>Email inviata!</h1>
            <p>
              Ti abbiamo inviato un link per reimpostare la password all'indirizzo:<br />
              <strong>{email}</strong>
            </p>
            <p className="check-spam">
              💡 <strong>Consiglio:</strong> Controlla anche la cartella spam se non trovi l'email.
            </p>
            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">
                Torna al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-card">

          <div className="forgot-password-header">
            <Mail size={48} className="header-icon" />
            <h1>Recupera Password</h1>
            <p>Inserisci la tua email per reimpostare la password</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="la-tua-email@esempio.com"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading || !email}
            >
              {loading ? 'Invio in corso...' : 'Invia link di recupero'}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>
              Ricordi la password? <Link to="/login">Accedi</Link>
            </p>
            <p>
              Non hai un account? <Link to="/register">Registrati</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword