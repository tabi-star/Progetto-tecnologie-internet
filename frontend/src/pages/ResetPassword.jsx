// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import axios from 'axios'
import './ForgotPassword.css'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(null)

  useEffect(() => {
    // Verifica se il token è valido
    const verifyToken = async () => {
      try {
        await axios.get(`/api/users/verify-reset-token/${token}`)
        setValidToken(true)
      } catch (err) {
        setValidToken(false)
        setError('Link di recupero non valido o scaduto')
      }
    }

    if (token) {
      verifyToken()
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/users/reset-password', {
        token,
        password: formData.password
      })
      
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel reset della password')
    } finally {
      setLoading(false)
    }
  }

  if (validToken === false) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="error-message">
            <h1>Link non valido</h1>
            <p>Il link di recupero password non è valido o è scaduto.</p>
            <div className="error-actions">
              <Link to="/forgot-password" className="btn btn-primary">
                Richiedi nuovo link
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Torna al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="success-message">
            <CheckCircle size={64} className="success-icon" />
            <h1>Password reimpostata!</h1>
            <p>La tua password è stata reimpostata con successo.</p>
            <p>Stai per essere reindirizzato alla pagina di login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-card">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna indietro
          </button>

          <div className="forgot-password-header">
            <Lock size={48} className="header-icon" />
            <h1>Nuova Password</h1>
            <p>Crea una nuova password per il tuo account</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="password">Nuova Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Almeno 6 caratteri"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Ripeti la password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? 'Reimpostazione in corso...' : 'Reimposta Password'}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>
              Torna al <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword