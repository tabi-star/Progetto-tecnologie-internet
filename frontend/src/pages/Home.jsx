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

  const resetProgressBar = () => {
    if (progressRef.current) {
      progressRef.current.style.animation = 'none'
      void progressRef.current.offsetWidth
      progressRef.current.style.animation = 'progress 5s linear forwards'
    }
  }

  const startAutoSlide = () => {

    if (upcomingMovies.length <= 1) return
  
    clearInterval(intervalRef.current)
    resetProgressBar();
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % upcomingMovies.length
        resetProgressBar()
        return next
      })
    }, 5000)

  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % upcomingMovies.length)
    resetProgressBar()
    startAutoSlide()
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + upcomingMovies.length) % upcomingMovies.length)
    resetProgressBar()
    startAutoSlide()
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    resetProgressBar()
    startAutoSlide()
  }

  if (loading) return <div className="loading">Caricamento...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="home">

      <section className="hero">
        {upcomingMovies.length > 0 && (
          <div className="banner">

            <div className="banner-slides">
              <div
                key={upcomingMovies[currentSlide]?.id}
                className="banner-slide active"
              >

                <div
                  className="banner-bg"
                  style={{
                    backgroundImage: `url(${upcomingMovies[currentSlide]?.banner_image || '/placeholder-movie.jpg'})`
                  }}
                />

                <div className="banner-centered">
                  <img
                    className="banner-img"
                    src={upcomingMovies[currentSlide]?.banner_image || upcomingMovies[currentSlide]?.foto_locandina || '/placeholder-movie.jpg'}
                    alt={upcomingMovies[currentSlide]?.title}
                  />

                  <div className="banner-content">
                    <h1 className="banner-title">{upcomingMovies[currentSlide]?.title}</h1>
                    <div className="banner-actions">
                      <Link to={`/movie/${upcomingMovies[currentSlide]?.id}`} state={{ from: location.pathname }} className="btn btn-primary">
                        <Play size={16} />
                        Scopri di più
                      </Link>
                    </div>
                
                    <div className="banner-dots">
                      {upcomingMovies.map((_, index) => (
                        <button
                        key={index}
                        className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {upcomingMovies.length > 1 && (
                  <>
                    <button className="banner-nav banner-nav-prev" onClick={prevSlide}>
                      <ChevronLeft size={28} className="nav-icon"/>
                    </button>
                    <button className="banner-nav banner-nav-next" onClick={nextSlide}>
                      <ChevronRight size={28} className="nav-icon"/>
                    </button>
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
                  </>
                )}
                
              </div>
            </div>

          </div>
        )}
      </section>

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