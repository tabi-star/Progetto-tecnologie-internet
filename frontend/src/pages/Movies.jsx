// src/pages/Movies.jsx

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import './Movies.css'

const Movies = () => {
  const [movies, setMovies] = useState([])
  /*const [screenings, setScreenings] = useState([])*/ /*Non sicuro di metterlo*/
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState(new Date()) // giorno iniziale visibile
  const scrollRef = useRef(null)

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

  useEffect(() => {
    fetchMovies()
    // Imposta la data di oggi come default
    /*const today = new Date().toISOString().split('T')[0]*/
    /*setSelectedDate(today)*/
  }, [])

  /*Penso si possa eliminare questo pezzo di codice*/
  /*useEffect(() => {
    if (selectedDate*/ /*&& movies *//*Non sono sicuro ci voglia anche l'array movies*//*) {*/
      /*fetchMoviesByScreeningsByDate(selectedDate);
    }
  }, [selectedDate*//*, movies*//*])*/

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
      // nessuna data selezionata → mostra tutti i film
      fetchMovies();
    } else {
      // data selezionata → mostra solo i film con screening in quella data
      fetchMoviesByScreeningsByDate(selectedDate);
    }
  }, [selectedDate]);
  
  // useEffect per aggiornare i movie quando cambia la data
  useEffect(() => {
    if (selectedDate) {
      fetchMoviesByScreeningsByDate(selectedDate)
    }
  }, [selectedDate])

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
            <Calendar size={24} />
            Seleziona la data
          </h3>

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
                  onClick={() => setSelectedDate(selectedDate === date ? '' : date)} /*non funziona (forse)*/
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
                      <Clock size={22} />
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