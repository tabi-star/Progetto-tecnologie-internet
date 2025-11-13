// src/pages/Login.jsx

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import './Login.css'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      setLoading(false)
      return
    }

    if (!isLogin && formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      let result
      
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      }

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <h1>{isLogin ? 'Accedi' : 'Registrati'}</h1>
            <p>
              {isLogin 
                ? 'Ben tornato! Accedi al tuo account' 
                : 'Crea un nuovo account per iniziare'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Il tuo nome"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tua@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={16} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="La tua password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={16} />
                  Conferma password
                </label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Conferma la password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <Link to="/forgot-password" className="forgot-password">
                  Password dimenticata?
                </Link>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Non hai un account?" : "Hai già un account?"}
              <button onClick={toggleMode} className="toggle-mode">
                {isLogin ? ' Registrati' : ' Accedi'}
              </button>
            </p>
          </div>

          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">🎬</div>
              <div className="feature-text">
                <strong>Prenota facilmente</strong>
                <span>Scegli i tuoi posti preferiti</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📧</div>
              <div className="feature-text">
                <strong>Conferma immediata</strong>
                <span>Ricevi i biglietti via email</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div className="feature-text">
                <strong>Pagamento sicuro</strong>
                <span>Transazioni protette</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login