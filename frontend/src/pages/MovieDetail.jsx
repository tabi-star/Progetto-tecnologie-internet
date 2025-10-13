// src/pages/MovieDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ArrowLeft, Ticket } from 'lucide-react'
import './MovieDetail.css'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMovie()
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [id])

  useEffect(() => {
    if (selectedDate && movie) {
      fetchScreenings()
    }
  }, [selectedDate, movie])

  const fetchMovie = async () => {
    try {
      const response = await axios.get(`/api/movies/${id}`)
      setMovie(response.data)
    } catch (err) {
      setError('Film non trovato')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchScreenings = async () => {
    try {
      const response = await axios.get(`/api/screenings/movie/${id}/date/${selectedDate}`)
      setScreenings(response.data)
    } catch (err) {
      console.error('Errore nel caricamento delle proiezioni:', err)
      setScreenings([])
    }
  }

  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Oggi' : 
               i === 1 ? 'Domani' : 
               date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })
      })
    }
    return dates
  }

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) return <div className="loading">Caricamento film...</div>
  if (error) return <div className="error">{error}</div>
  if (!movie) return <div className="error">Film non trovato</div>

  return (
    <div className="movie-detail">
      <div className="container">
        {/* Header con navigazione */}
        <div className="movie-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna indietro
          </button>
        </div>

        {/* Movie Hero */}
        <div className="movie-hero">
          <div className="movie-poster-large">
            <img 
              src={movie.foto_locandina || '/placeholder-movie.jpg'} 
              alt={movie.title}
              onError={(e) => {
                e.target.src = '/placeholder-movie.jpg'
              }}
            />
          </div>
          
          <div className="movie-info">
            <h1>{movie.title}</h1>
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-meta-grid">
              <div className="meta-item">
                <strong>Durata:</strong>
                <span>{Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</span>
              </div>
              <div className="meta-item">
                <strong>Lingua:</strong>
                <span>{movie.language}</span>
              </div>
              <div className="meta-item">
                <strong>Data uscita:</strong>
                <span>{new Date(movie.release_date).toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screening Selection */}
        <section className="screenings-section">
          <h2>
            <Calendar size={24} />
            Proiezioni disponibili
          </h2>

          {/* Date Selector */}
          <div className="date-selector">
            <div className="date-buttons">
              {getWeekDates().map(({ date, label }) => (
                <button
                  key={date}
                  className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Screenings List */}
          <div className="screenings-list">
            {screenings.length > 0 ? (
              screenings.map(screening => (
                <div key={screening.id} className="screening-card">
                  <div className="screening-time">
                    <Clock size={20} />
                    <strong>{formatTime(screening.start_time)}</strong>
                  </div>
                  
                  <div className="screening-info">
                    <div className="screening-hall">
                      <span className="hall-name">{screening.hall_name}</span>
                      <span className="hall-type">{screening.hall_type}</span>
                    </div>
                    <div className="screening-duration">
                      {Math.floor(screening.duration_minutes / 60)}h {screening.duration_minutes % 60}m
                    </div>
                  </div>

                  <Link 
                    to={`/seats/${screening.id}`}
                    className="btn btn-primary"
                  >
                    <Ticket size={16} />
                    Prenota
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-screenings">
                <h3>Nessuna proiezione disponibile per questa data</h3>
                <p>Seleziona un'altra data per vedere le proiezioni disponibili</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MovieDetail