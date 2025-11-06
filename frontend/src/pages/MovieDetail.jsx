// src/pages/MovieDetail.jsx

import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowLeft, Ticket, LucideSquareArrowUpRight } from 'lucide-react'
import './MovieDetail.css'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

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

  useEffect(() => {
    fetchMovie()
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [id])

  const fetchScreenings = async () => {
    try {
      const response = await axios.get(`/api/screenings/movie/${id}/date/${selectedDate}`)
      setScreenings(response.data)
    } catch (err) {
      console.error('Errore nel caricamento delle proiezioni:', err)
      setScreenings([])
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se il click NON avviene dentro .date-buttons
      if (!event.target.closest('.date-buttons') && !event.target.closest('.left-arrow-btn') && !event.target.closest('.right-arrow-btn')) {
        setSelectedDate('');
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedDate && movie) {
      fetchScreenings()
    }
  }, [selectedDate, movie])

  useEffect(() => {
    if (!selectedDate) {
      setScreenings([]);
    } else if (selectedDate && movie) {
      fetchScreenings;
    }
  }, [selectedDate])

  // Genera date della settimana
  const getWeekDates = () => {
    const dates = []
    /*const today = new Date()*/
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate/*today*/)
      /*date.setDate(today.getDate() + i)*/
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

  // 🔹 Sposta i 7 giorni in avanti
  const handleNextDays = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 1)
    setStartDate(newStart)
  }

  // 🔹 Sposta i 7 giorni indietro (senza andare prima di oggi)
  const handlePrevDays = () => {
    const today = new Date()
    if (startDate.toDateString() === today.toDateString()) return
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 1)
    setStartDate(newStart)
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
          {/*<button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna indietro
          </button>*/}
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
          
          <div className="detail-movie-info">
            
            <h1>{movie.title}</h1>

            <div className="movie-details-container">

              <p className="detail-movie-description">{movie.description}</p>
            
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

            <hr />

          </div>
          
        </div>

        {/* Screening Selection */}
        <section className="screenings-section">

          {/* Date Selector */}
          <div className="date-selector">
            <h2>
              <Calendar size={24} />
              Proiezioni disponibili
            </h2>

            <div className="date-buttons-container">

              <button
                className="left-arrow-btn"
                onClick={handlePrevDays}
              >
                <ChevronLeft size={30} />
              </button>

              <div className="date-buttons" ref={scrollRef}>
                {getWeekDates().map(({ date, label }) => (
                  <button
                    key={date}
                    className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === date ? '' : date)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                className="right-arrow-btn"
                onClick={handleNextDays}
              >
                <ChevronRight size={30} />
              </button>

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
                      <div className="hall-name">{screening.hall_name}</div>
                      <div className="hall-type">{screening.hall_type}</div>
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