// src/pages/ScreeningSelection.jsx

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ArrowLeft, Ticket } from 'lucide-react'
import './ScreeningSelection.css'

const ScreeningSelection = () => {
  const { movieId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const dateFromParams = searchParams.get('date')
    if (dateFromParams) {
      setSelectedDate(dateFromParams)
    } else {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
    fetchMovie()
  }, [movieId, searchParams])

  useEffect(() => {
    if (selectedDate && movieId) {
      fetchScreenings()
    }
  }, [selectedDate, movieId])

  const fetchMovie = async () => {
    try {
      const response = await axios.get(`/api/movies/${movieId}`)
      setMovie(response.data)
    } catch (err) {
      setError('Film non trovato')
      console.error(err)
    }
  }

  const fetchScreenings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/screenings/movie/${movieId}/date/${selectedDate}`)
      setScreenings(response.data)
    } catch (err) {
      console.error('Errore nel caricamento delle proiezioni:', err)
      setScreenings([])
    } finally {
      setLoading(false)
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

  if (error) return <div className="error">{error}</div>

  return (
    <div className="screening-selection">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna al film
          </button>
          {movie && (
            <div className="movie-mini-info">
              <img 
                src={movie.foto_locandina || '/placeholder-movie.jpg'} 
                alt={movie.title}
                className="movie-thumb"
              />
              <div>
                <h1>{movie.title}</h1>
                <p>Scegli la proiezione</p>
              </div>
            </div>
          )}
        </div>

        {/* Date Selector */}
        <section className="date-section">
          <h2>
            <Calendar size={24} />
            Seleziona la data
          </h2>
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
        </section>

        {/* Screenings */}
        <section className="screenings-section">
          <h2>
            <Clock size={24} />
            Proiezioni del {selectedDate && new Date(selectedDate).toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h2>

          {loading ? (
            <div className="loading">Caricamento proiezioni...</div>
          ) : screenings.length > 0 ? (
            <div className="screenings-grid">
              {screenings.map(screening => (
                <div key={screening.id} className="screening-card">
                  <div className="screening-header">
                    <div className="screening-time">
                      <strong>{formatTime(screening.start_time)}</strong>
                    </div>
                    <div className="screening-duration">
                      {Math.floor(screening.duration_minutes / 60)}h {screening.duration_minutes % 60}m
                    </div>
                  </div>

                  <div className="screening-info">
                    <div className="hall-info">
                      <span className="hall-name">{screening.hall_name}</span>
                      <span className="hall-type">{screening.hall_type}</span>
                    </div>
                    <div className="screening-meta">
                      <span className="capacity">Posti disponibili: {screening.capacity}</span>
                    </div>
                  </div>

                  <div className="screening-actions">
                    <Link 
                      to={`/seats/${screening.id}`}
                      className="btn btn-primary btn-large"
                    >
                      <Ticket size={16} />
                      Scegli i posti
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-screenings">
              <h3>Nessuna proiezione disponibile per questa data</h3>
              <p>Seleziona un'altra data per vedere le proiezioni disponibili</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ScreeningSelection