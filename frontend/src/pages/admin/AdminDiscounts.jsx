import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Plus, Copy, CheckCircle, XCircle, Calendar, Percent } from 'lucide-react'
import './AdminDiscounts.css'

const AdminDiscounts = () => {
  const { user } = useAuth()
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 20,
    valid_until: ''
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get('/api/discounts/my-codes')
      setDiscounts(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei codici sconto')
    } finally {
      setLoading(false)
    }
  }

  const generateCode = () => {
    const randomCode = `CINEMA${Date.now().toString().slice(-6)}`
    setFormData(prev => ({ ...prev, code: randomCode }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Imposta la scadenza di default a 30 giorni se non specificata
    const validUntil = formData.valid_until || 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      await axios.post('/api/discounts/generate', {
        ...formData,
        valid_until: validUntil
      })

      setSuccess('Codice sconto generato con successo')
      resetForm()
      fetchDiscounts()
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella generazione del codice')
    }
  }

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Errore nella copia:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 20,
      valid_until: ''
    })
    setShowForm(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date()
  }

  if (!user || user.role !== 'admin') {
    return <div className="error">Accesso negato</div>
  }

  return (
    <div className="admin-discounts">
      <div className="container">
        <div className="page-header">
          <h1>Codici Sconto Dipendenti</h1>
          <p>Genera e gestisci i codici sconto per i dipendenti</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="discounts-header">
          <div className="header-info">
            <h2>I tuoi Codici Sconto</h2>
            <span className="count-badge">{discounts.length} codici</span>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Genera Codice
          </button>
        </div>

        {showForm && (
          <div className="discount-form-overlay">
            <div className="discount-form">
              <h2>Genera Nuovo Codice Sconto</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Codice Sconto *</label>
                    <div className="code-input">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Lascia vuoto per generare automaticamente"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={generateCode}
                        className="btn btn-secondary"
                      >
                        Genera
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Sconto (%) *</label>
                    <div className="percent-input">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) }))}
                      />
                      <span className="percent-value">{formData.discount_percent}%</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Valido fino al</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <small>Lascia vuoto per 30 giorni di validità</small>
                  </div>
                </div>

                <div className="discount-preview">
                  <h4>Anteprima Codice:</h4>
                  <div className="preview-card">
                    <div className="preview-code">{formData.code || 'CODICE123'}</div>
                    <div className="preview-details">
                      <span className="preview-percent">{formData.discount_percent}% di sconto</span>
                      <span className="preview-expiry">
                        Valido fino al {formData.valid_until ? formatDate(formData.valid_until) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Genera Codice
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Caricamento codici...</div>
        ) : (
          <div className="discounts-grid">
            {discounts.map(discount => (
              <div key={discount.id} className={`discount-card ${discount.used ? 'used' : ''} ${isExpired(discount.valid_until) ? 'expired' : ''}`}>
                <div className="discount-header">
                  <div className="discount-code">
                    <h3>{discount.code}</h3>
                    <button 
                      onClick={() => copyToClipboard(discount.code)}
                      className="copy-btn"
                      title="Copia codice"
                    >
                      {copiedCode === discount.code ? (
                        <CheckCircle size={16} className="copied" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  
                  <div className="discount-percent">
                    <Percent size={20} />
                    <span>{discount.discount_percent}%</span>
                  </div>
                </div>

                <div className="discount-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <div className="detail-info">
                      <span className="detail-label">Valido fino al</span>
                      <span className="detail-value">{formatDate(discount.valid_until)}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    {discount.used ? (
                      <XCircle size={16} className="used-icon" />
                    ) : (
                      <CheckCircle size={16} className="available-icon" />
                    )}
                    <div className="detail-info">
                      <span className="detail-label">Stato</span>
                      <span className="detail-value">
                        {discount.used ? 'Utilizzato' : isExpired(discount.valid_until) ? 'Scaduto' : 'Disponibile'}
                      </span>
                    </div>
                  </div>

                  {discount.used && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <span className="detail-label">Utilizzato da</span>
                        <span className="detail-value">Utente #{discount.used_by}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="discount-stats">
                  <div className="stat">
                    <span className="stat-label">Generato il</span>
                    <span className="stat-value">{formatDate(discount.created_at)}</span>
                  </div>
                  
                  {discount.used && (
                    <div className="stat">
                      <span className="stat-label">Utilizzato il</span>
                      <span className="stat-value">{formatDate(discount.used_at)}</span>
                    </div>
                  )}
                </div>

                <div className="discount-status">
                  {discount.used ? (
                    <span className="status-badge used">Utilizzato</span>
                  ) : isExpired(discount.valid_until) ? (
                    <span className="status-badge expired">Scaduto</span>
                  ) : (
                    <span className="status-badge active">Attivo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {discounts.length === 0 && !loading && (
          <div className="no-discounts">
            <Percent size={48} />
            <h3>Nessun codice sconto generato</h3>
            <p>Genera il primo codice sconto per i dipendenti</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDiscounts