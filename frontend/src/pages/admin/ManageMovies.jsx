// src/pages/admin/ManageMovies.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'
import './ManageMovies.css'

const ManageMovies = () => {
  const { user } = useAuth()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    release_date: '',
    language: 'Italiano',
    foto_locandina: '',
    banner_image: '',
  })

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies')
      setMovies(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei film')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingMovie) {
        await axios.put(`/api/movies/${editingMovie.id}`, formData)
        setSuccess('Film aggiornato con successo')
      } else {
        await axios.post('/api/movies', formData)
        setSuccess('Film aggiunto con successo')
      }

      resetForm()
      fetchMovies()
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio')
    }
  }

  const handleEdit = (movie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      description: movie.description,
      duration_minutes: movie.duration_minutes,
      release_date: movie.release_date,
      language: movie.language,
      foto_locandina: movie.foto_locandina || '',
      banner_image: movie.banner_image || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (movieId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo film?')) {
      try {
        await axios.delete(`/api/movies/${movieId}`)
        setSuccess('Film eliminato con successo')
        fetchMovies()
      } catch (err) {
        setError('Errore nell\'eliminazione del film')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration_minutes: '',
      release_date: '',
      language: 'Italiano',
      foto_locandina: '',
      banner_image: ''
    })
    setEditingMovie(null)
    setShowForm(false)
  }

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user || user.role !== 'admin') {
    return <div className="error">Accesso negato</div>
  }

  return (
    <div className="manage-movies">
      <div className="container">
        <div className="page-header">
          <h1>Gestisci Film</h1>
          <p>Amministra il catalogo film del cinema</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="movies-actions">
          <div className="search-filter">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Cerca film..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary">
              <Filter size={16} />
              Filtri
            </button>
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Aggiungi Film
          </button>
        </div>

        {showForm && (
          <div className="movie-form-overlay">
            <div className="movie-form">
              <h2>{editingMovie ? 'Modifica Film' : 'Aggiungi Nuovo Film'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Titolo *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Durata (minuti) *</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Data di uscita *</label>
                    <input
                      type="date"
                      value={formData.release_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lingua</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="Italiano">Italiano</option>
                      <option value="Originale">Originale</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>URL Locandina</label>
                    <input
                      type="url"
                      value={formData.foto_locandina}
                      onChange={(e) => setFormData(prev => ({ ...prev, foto_locandina: e.target.value }))}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>URL Immagine per il banner della homepage</label>
                    <input
                      type="url"
                      value={formData.banner_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, banner_image: e.target.value }))}
                      placeholder="https://example.com/homepage-banner-image.jpg"
                    />
                  </div>


                  <div className="form-group full-width">
                    <label>Descrizione *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingMovie ? 'Aggiorna Film' : 'Aggiungi Film'}
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
          <div className="loading">Caricamento film...</div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img 
                    src={movie.foto_locandina || '/placeholder-movie.jpg'}
                    alt={movie.title}
                  />
                  <div className="movie-actions">
                    <button 
                      onClick={() => handleEdit(movie)}
                      className="btn-action edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(movie.id)}
                      className="btn-action delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-description">
                    {movie.description?.substring(0, 100)}...
                  </p>
                  
                  <div className="movie-meta">
                    <span className="duration">
                      {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                    </span>
                    <span className="language">{movie.language}</span>
                    <span className="release-date">
                      {new Date(movie.release_date).toLocaleDateString('it-IT')}
                    </span>
                  </div>

                  <div className="movie-stats">
                    <span>Aggiunto il: {new Date(movie.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMovies.length === 0 && !loading && (
          <div className="no-movies">
            <h3>Nessun film trovato</h3>
            <p>{searchTerm ? 'Prova a modificare i termini di ricerca' : 'Aggiungi il primo film al catalogo'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageMovies