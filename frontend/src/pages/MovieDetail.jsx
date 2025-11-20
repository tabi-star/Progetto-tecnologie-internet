import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowLeft, Ticket, LucideSquareArrowUpRight } from 'lucide-react'
import './MovieDetail.css'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [searchParams] = useSearchParams()
  const [screenings, setScreenings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const storedDate = localStorage.getItem("selectedDate")
  const [startDate, setStartDate] = useState(storedDate ? new Date(storedDate) : new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const [availableSeats, setAvailableSeats] = useState({});
  const dateSelectorDetailRef = useRef(null);

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

  useEffect(() => {
    //const storedDate = localStorage.getItem("selectedDate") //OCCHIO AD ELIMINARLO!!!
    const dateFromParams = searchParams.get('date')
    if (dateFromParams) {
      setSelectedDate(dateFromParams)
    }
    else if (storedDate) {
      setSelectedDate(storedDate)
    } else {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
    fetchMovie()

    return () => {
      localStorage.removeItem("selectedDate");
      setSelectedDate('');
    };
  }, [id, searchParams])

  const fetchScreenings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/screenings/movie/${id}/date/${selectedDate}`)
      setScreenings(response.data)
    } catch (err) {
      console.error('Errore nel caricamento delle proiezioni:', err)
      setScreenings([])
    } finally {
      setLoading(false)
    }
  }

  const getAvailableSeats = async (screeningId) => {
    try {
      const response = await axios.get(`/api/seats/screening/${screeningId}`);
      const seats = response.data;
      const availableCount = seats.filter(seat => seat.status === 'available').length;

      setAvailableSeats(prev => ({
        ...prev,
        [screeningId]: availableCount
      }));
    } catch (err) {
      console.error(`Errore nel caricamento dei posti per la proiezione ${screeningId}:`, err);
    }
  };

  useEffect(() => {
    if (screenings.length > 0) {
      (async () => {
        for (const screening of screenings) {
          await getAvailableSeats(screening.id);
        }
      })();
    }
  }, [screenings]);

  //DA PARLARNE CON TABI!!!
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dateSelectorDetailRef.current?.contains(event.target)) return;
      // Se il click NON avviene dentro .date-buttons
      if (!event.target.closest('.date-buttons') && !event.target.closest('.left-arrow-btn') && !event.target.closest('.right-arrow-btn')) {
        setSelectedDate('');
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);
  //PROVA ANCHE CON SOLO L'ID (FORSE)
  useEffect(() => {
    if (selectedDate && movie) {
      fetchScreenings()
    }
  }, [selectedDate, movie]) //opure secondo parametro può essere id

  useEffect(() => {
    if (!selectedDate) {
      setScreenings([]);
    } else if (selectedDate && movie) {
      fetchScreenings;
    }
  }, [selectedDate])

  const getWeekDates = () => {
    const dates = []
    const baseDate = selectedDate ? new Date(selectedDate) : new Date()
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

  // Sposta i 7 giorni in avanti
  const handleNextDays = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 1)
    setStartDate(newStart)
  }

  // Sposta i 7 giorni indietro (senza andare prima di oggi)
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

  if (error) return <div className="error">{error}</div>
  if (!movie) return <div className="error">Film non trovato</div>

  function getEndTime(startTime, durationMinutes) {
    const start = new Date(startTime);
    if (isNaN(start)) {
      console.warn("Data non valida:", startTime);
      return "Orario non disponibile";
    }
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="movie-detail">
      <div className="container">

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
          <div className="date-selector" ref={dateSelectorDetailRef}>
            <h2>
              <Calendar size={24} />
              Proiezioni disponibili
            </h2>

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
                      setSelectedDate(selectedDate === date ? '' : date)
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

          {loading ? (
            <div className="loading">Caricamento proiezioni...</div>
          ) : screenings.length > 0 ? (
            <div className="screenings-list">
              {screenings.map(screening => (
                <div key={screening.id} className="screening-card">
                  <div className="screening-header">
                    <div className="screening-time">
                      <strong>{formatTime(screening.start_time)} - {getEndTime(screening.start_time, screening.duration_minutes)}</strong>
                    </div>
                  </div>

                  <div className="screening-info">
                    <div className="hall-info">
                      <span className="hall-name">{screening.hall_name}</span>
                      <span className="hall-type">{screening.hall_type}</span>
                    </div>
                    <div className="screening-meta">
                      {availableSeats[screening.id] === 0 ? (
                        <span className="capacity soldout">Posti esauriti</span>
                      ) : (
                        <span className="capacity">
                          Posti disponibili: {availableSeats[screening.id] ?? '...'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="screening-actions">
                    <Link 
                      to={`/seats/${screening.id}`}
                      className={`btn btn-primary ${availableSeats[screening.id] === 0 ? 'disabled' : ''}`}
                      onClick={(e) => {
                       if (availableSeats[screening.id] === 0) e.preventDefault();
                      }}
                    >
                      <Ticket size={16} />
                      {availableSeats[screening.id] === 0 ? 'Non disponibile' : 'Prenota i posti'}
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

export default MovieDetail