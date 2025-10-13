import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Plus, Edit2, Trash2, Calendar, Clock, Film, Building } from 'lucide-react'
import './ManageScreenings.css'

const ManageScreenings = () => {
  const { user } = useAuth()
  const [screenings, setScreenings] = useState([])
  const [movies, setMovies] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingScreening, setEditingScreening] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [overlapCheck, setOverlapCheck] = useState(null)

  const [formData, setFormData] = useState({
    movie_id: '',
    hall_id: '',
    start_time: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [screeningsRes, moviesRes, hallsRes] = await Promise.all([
        axios.get('/api/screenings'),
        axios.get('/api/movies'),
        axios.get('/api/halls')
      ])
      
      setScreenings(screeningsRes.data)
      setMovies(moviesRes.data)
      setHalls(hallsRes.data)
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const checkOverlap = async () => {
    if (!formData.movie_id || !formData.hall_id || !formData.start_time) {
      return
    }

    try {
      const response = await axios.post('/api/screenings/check-overlap', formData)
      setOverlapCheck(response.data)
    } catch (err) {
      console.error('Errore nel controllo sovrapposizioni:', err)
    }
  }

  useEffect(() => {
    if (formData.hall_id && formData.start_time) {
      const timeoutId = setTimeout(checkOverlap, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [formData.hall_id, formData.start_time])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (overlapCheck?.hasOverlap) {
      setError('Sovrapposizione rilevata con altre proiezioni')
      return
    }

    try {
      if (editingScreening) {
        await axios.put(`/api/screenings/${editingScreening.id}`, formData)
        setSuccess('Proiezione aggiornata con successo')
      } else {
        await axios.post('/api/screenings', formData)
        setSuccess('Proiezione aggiunta con successo')
      }

      resetForm()
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio')
    }
  }

  const handleEdit = (screening) => {
    setEditingScreening(screening)
    setFormData({
      movie_id: screening.movie_id,
      hall_id: screening.hall_id,
      start_time: screening.start_time.split('.')[0] // Rimuovi millisecondi per input datetime-local
    })
    setShowForm(true)
  }

  const handleDelete = async (screeningId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa proiezione?')) {
      try {
        await axios.delete(`/api/screenings/${screeningId}`)
        setSuccess('Proiezione eliminata con successo')
        fetchData()
      } catch (err) {
        setError('Errore nell\'eliminazione della proiezione')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      movie_id: '',
      hall_id: '',
      start_time: ''
    })
    setEditingScreening(null)
    setShowForm(false)
    setOverlapCheck(null)
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || user.role !== 'admin') {
    return <div className="error">Accesso negato</div>
  }

  return (
    <div className="manage-screenings">
      <div className="container">
        <div className="page-header">
          <h1>Gestisci Proiezioni</h1>
          <p>Programma e gestisci le proiezioni del cinema</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="screenings-header">
          <div className="header-info">
            <h2>Proiezioni Programmate</h2>
            <span className="count-badge">{screenings.length} proiezioni</span>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Nuova Proiezione
          </button>
        </div>

        {showForm && (
          <div className="screening-form-overlay">
            <div className="screening-form">
              <h2>{editingScreening ? 'Modifica Proiezione' : 'Nuova Proiezione'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Film *</label>
                    <select
                      value={formData.movie_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, movie_id: e.target.value }))}
                      required
                    >
                      <option value="">Seleziona un film</option>
                      {movies.map(movie => (
                        <option key={movie.id} value={movie.id}>
                          {movie.title} ({Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sala *</label>
                    <select
                      value={formData.hall_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, hall_id: e.target.value }))}
                      required
                    >
                      <option value="">Seleziona una sala</option>
                      {halls.map(hall => (
                        <option key={hall.id} value={hall.id}>
                          {hall.name} ({hall.hall_type} - {hall.capacity} posti)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Data e Ora *</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {overlapCheck && (
                  <div className={`overlap-check ${overlapCheck.hasOverlap ? 'error' : 'success'}`}>
                    {overlapCheck.hasOverlap ? (
                      <div>
                        <strong>⚠️ Sovrapposizione rilevata:</strong>
                        <ul>
                          {overlapCheck.overlappingScreenings.map(screening => (
                            <li key={screening.id}>
                              {screening.movie_title} - {formatDateTime(screening.start_time)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>✅ Nessuna sovrapposizione rilevata</div>
                    )}
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={overlapCheck?.hasOverlap}
                  >
                    {editingScreening ? 'Aggiorna Proiezione' : 'Crea Proiezione'}
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
          <div className="loading">Caricamento proiezioni...</div>
        ) : (
          <div className="screenings-list">
            {screenings.map(screening => (
              <div key={screening.id} className="screening-card">
                <div className="screening-main">
                  <div className="screening-poster">
                    <img 
                      src={screening.foto_locandina || '/placeholder-movie.jpg'} 
                      alt={screening.title}
                    />
                  </div>
                  
                  <div className="screening-info">
                    <h3>{screening.title}</h3>
                    
                    <div className="screening-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{formatDateTime(screening.start_time)}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{Math.floor(screening.duration_minutes / 60)}h {screening.duration_minutes % 60}m</span>
                      </div>
                      <div className="detail-item">
                        <Building size={16} />
                        <span>{screening.hall_name} ({screening.hall_type})</span>
                      </div>
                      <div className="detail-item">
                        <Film size={16} />
                        <span>{screening.language}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="screening-actions">
                  <button 
                    onClick={() => handleEdit(screening)}
                    className="btn-action edit"
                  >
                    <Edit2 size={16} />
                    Modifica
                  </button>
                  <button 
                    onClick={() => handleDelete(screening.id)}
                    className="btn-action delete"
                  >
                    <Trash2 size={16} />
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {screenings.length === 0 && !loading && (
          <div className="no-screenings">
            <Calendar size={48} />
            <h3>Nessuna proiezione programmata</h3>
            <p>Crea la prima proiezione per iniziare</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageScreenings