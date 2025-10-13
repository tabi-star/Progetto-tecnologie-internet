import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import './Home.css'

const Home = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const progressRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchUpcomingMovies()
  }, [])

  useEffect(() => {
    startAutoSlide()
    return () => clearInterval(intervalRef.current)
  }, [upcomingMovies.length])

  const fetchUpcomingMovies = async () => {
    try {
      const response = await axios.get('/api/movies/upcoming')
      setUpcomingMovies(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei film')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startAutoSlide = () => {
    if (upcomingMovies.length <= 1) return
    
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % upcomingMovies.length)
    }, 5000)
  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % upcomingMovies.length)
    startAutoSlide()
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + upcomingMovies.length) % upcomingMovies.length)
    startAutoSlide()
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    startAutoSlide()
  }

  if (loading) return <div className="loading">Caricamento...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero">
        {upcomingMovies.length > 0 && (
          <div className="banner">
            <div className="banner-slides">
              {upcomingMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${movie.foto_locandina || '/placeholder-movie.jpg'})`
                  }}
                >
                  <div className="banner-content">
                    <h1 className="banner-title">{movie.title}</h1>
                    <p className="banner-description">
                      {movie.description?.substring(0, 150)}...
                    </p>
                    <div className="banner-actions">
                      <Link to={`/movie/${movie.id}`} className="btn btn-primary">
                        <Play size={16} />
                        Scopri di più
                      </Link>
                    </div>
                  </div>
            </div>
              ))}
            </div>

            {/* Navigation */}
            {upcomingMovies.length > 1 && (
              <>
                <button className="banner-nav banner-nav-prev" onClick={prevSlide}>
                  <ChevronLeft size={24} />
                </button>
                <button className="banner-nav banner-nav-next" onClick={nextSlide}>
                  <ChevronRight size={24} />
                </button>

                {/* Progress bar */}
                <div className="banner-progress">
                  <div 
                    ref={progressRef}
                    className="banner-progress-bar" 
                    style={{ 
                      animationDuration: '5s',
                      animationPlayState: 'running'
                    }}
                  />
                </div>

                {/* Dots indicator */}
                <div className="banner-dots">
                  {upcomingMovies.map((_, index) => (
                    <button
                      key={index}
                      className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Scopri tutti i film in programmazione</h2>
            <p>Consulta l'elenco completo dei film e trova la proiezione perfetta per te</p>
            <Link to="/movies" className="btn btn-primary btn-large">
              Consulta i film
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home