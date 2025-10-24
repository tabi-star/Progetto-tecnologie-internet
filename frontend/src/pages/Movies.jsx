// src/pages/Movies.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock } from 'lucide-react'
import './Movies.css'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchMovies()
    // Imposta la data di oggi come default
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies')
      setMovies(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei film')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Genera date della settimana
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

  if (loading) return <div className="loading">Caricamento film...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="movies-page">
      <div className="container">
        <div className="page-header">
          <h1>Film in Programmazione</h1>
          <p>Scegli tra i migliori film del momento</p>
        </div>

        {/* Date Selector */}
        <div className="date-selector">
          <h3>
            <Calendar size={20} />
            Seleziona la data
          </h3>
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

        {/* Movies Grid */}
        <div className="movies-grid">
          {movies.map(movie => (
            <div key={movie.id} className="movie-card">
              <div className="movie-head-data">
                <div className="movie-poster">
                  <img 
                    src={movie.foto_locandina || '/placeholder-movie.jpg'} 
                    alt={movie.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-movie.jpg'
                    }}
                  />
                  <div className="movie-overlay">
                    <Link to={`/movie/${movie.id}`} className="btn btn-primary">
                      Dettagli
                    </Link>
                    <Link 
                      to={`/screening/${movie.id}?date=${selectedDate}`} 
                      className="btn btn-secondary"
                    >
                      <Clock size={16} />
                      Orari
                    </Link>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span className="movie-duration">
                      {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                    </span>
                    <span className="movie-language">{movie.language}</span>
                  </div>
                </div>  
              </div> 

              <div className="movie-description">
                <p> {movie?.description || null} </p>
              </div>

              {/*<div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-description">
                  {movie.description?.substring(0, 120)}...
                </p>
                <div className="movie-meta">
                  <span className="movie-duration">
                    {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                  </span>
                  <span className="movie-language">{movie.language}</span>
                </div>
              </div>*/}
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="no-movies">
            <h3>Nessun film disponibile</h3>
            <p>Ritorna più tardi per scoprire i nuovi film in programmazione</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies