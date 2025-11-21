import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import './Movies.css'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const scrollRef = useRef(null)
  const dateSelectorRef = useRef(null);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies/available')
      setMovies(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei film')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMoviesByScreeningsByDate = async (selectedDate) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/movies/by-screenings/${selectedDate}`)
      setMovies(response.data)
    } catch (err) {
      console.error(`Errore nel caricamento dei film del ${selectedDate}:`, err)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedDate) {
      fetchMovies()
    } else {
      fetchMoviesByScreeningsByDate(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    const dateFromParams = searchParams.get('date')
    if (dateFromParams) {
      setSelectedDate(dateFromParams)
    } else {
      setSelectedDate('')
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedDate");
    };
  }, []);

  const getWeekDates = () => {
    const dates = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dates.push({
        date: date.toISOString().split('T')[0],
        label:
          date.toDateString() === today.toDateString() ? 'Oggi' :
          date.toDateString() === tomorrow.toDateString() ? 'Domani' :
          date.toLocaleDateString('it-IT', { weekday : 'long', day : 'numeric', month : 'long' }),
      })
    }
    return dates
  }

  const handleNextDays = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 1)
    setStartDate(newStart)
  }

  const handlePrevDays = () => {
    const today = new Date()
    if (startDate.toDateString() === today.toDateString()) return
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 1)
    setStartDate(newStart)
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

        <div className="date-selector" ref={dateSelectorRef}>
          <h3>
            <Calendar size={24} />
            Seleziona la data
          </h3>

          <div className="date-buttons-container">

            <button
              type="button"
              className="left-arrow-btn"
              onClick={handlePrevDays}
            >
              <ChevronLeft size={30} />
            </button>

            <div className="date-buttons" ref={scrollRef}>
              {getWeekDates().map(({ date, label }) => (
                <button
                  type="button"
                  key={date}
                  className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedDate === date) {
                      setSelectedDate('');
                      localStorage.removeItem("selectedDate");
                    } else {
                      setSelectedDate(date);
                      localStorage.setItem("selectedDate", date);
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="right-arrow-btn"
              onClick={handleNextDays}
            >
              <ChevronRight size={30} />
            </button>

          </div>
        </div>

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
                    <Link to={`/movie/${movie.id}`} state={{ from: location.pathname }} className="btn movie-btn-primary">
                      Dettagli
                    </Link>
                    <Link 
                      to={`/screening/${movie.id}?date=${selectedDate}`}
                      state={{ from: location.pathname }} 
                      className="btn movie-btn-secondary"
                    >
                      <Clock />
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
                <p> {movie?.description
                      .split(' ')
                      .slice(0, 30)
                      .join(' ') + (movie.description.split(' ').length > 30 ? '...' : '') || null}
                </p>
              </div>
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