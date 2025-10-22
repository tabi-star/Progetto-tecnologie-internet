// src/pages/Home.jsx

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
      void progressRef.current.offsetWidth // forza reflow per riavviare l'animazione
      progressRef.current.style.animation = 'progress 5s linear forwards'
    }
  }

  const startAutoSlide = () => {

    if (upcomingMovies.length <= 1) return
  
    clearInterval(intervalRef.current)
    resetProgressBar(); // resetta all'inizio
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % upcomingMovies.length
        resetProgressBar() // ogni cambio slide
        return next
      })
    }, 5000)

  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % upcomingMovies.length)
    {/* CODICE CHE POTREBBE ESSERE UTILE PER IL BANNER "ROTANTE" */}
    {/*useEffect(() => {
      if (currentSlide === upcomingMovies.length) {
        // Disattiva transizione momentaneamente
        setTimeout(() => {
          document.querySelector('.banner-slides').style.transition = 'none';
          setCurrentSlide(0);
          // Ripristina la transizione per gli step successivi
          setTimeout(() => {
            document.querySelector('.banner-slides').style.transition = 'transform 0.8s ease-in-out';
          }, 50);
        }, 800); // 800 ms = durata della tua transizione
      }
    }, [currentSlide])*/}
    {/*if (currentSlide === upcomingMovies.length - 1) {
      // vai temporaneamente alla copia nascosta della prima
      setCurrentSlide(currentSlide + 1);
      setTimeout(() => {
        // disabilita la transizione e torna invisibilmente a 0
        setIsTransitioning(false);
        setCurrentSlide(0);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 800);
    } else {
      setCurrentSlide(currentSlide + 1);
    }*/}
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
      {/* Hero Banner */}
      <section className="hero">
        {upcomingMovies.length > 0 && (
          <div className="banner">

            {/*<div className="banner-slides">
              <div
                key={upcomingMovies[currentSlide]?.id}
                className="banner-slide active"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${upcomingMovies[currentSlide]?.banner_image || '/placeholder-movie.jpg'})`
                }}
              >
                <div className="banner-content">
                  <h1 className="banner-title">{upcomingMovies[currentSlide]?.title}</h1> 
                  {/*<p className="banner-description">
                    {upcomingMovies[currentSlide]?.description?.substring(0, 150)}...
                  </p>*/}
                  {/*<div className="banner-actions">
                    <Link to={`/movie/${upcomingMovies[currentSlide]?.id}`} className="btn btn-primary">
                      <Play size={16} />
                      Scopri di più
                    </Link>
                  </div>
                </div>
              </div>
            </div>*/}

            <div className="banner-slides">
              <div
                key={upcomingMovies[currentSlide]?.id}
                className="banner-slide active"
              >

                {/* Sfondo sfocato */}
                <div
                  className="banner-bg"
                  style={{
                    backgroundImage: `url(${upcomingMovies[currentSlide]?.banner_image || '/placeholder-movie.jpg'})`
                  }}
                />

                {/* Immagine principale centrata */}
                <div className="banner-centered">
                  <img
                    className="banner-img"
                    src={upcomingMovies[currentSlide]?.banner_image || '/placeholder-movie.jpg'}
                    alt={upcomingMovies[currentSlide]?.title}
                  />

                  {/* Contenuto testuale */}
                  <div className="banner-content">
                    <h1 className="banner-title">{upcomingMovies[currentSlide]?.title}</h1>
                    <div className="banner-actions">
                      <Link to={`/movie/${upcomingMovies[currentSlide]?.id}`} className="btn btn-primary">
                        <Play size={16} />
                        Scopri di più
                      </Link>
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
                  </div>
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
                  </>
                )}
                
              </div>
            </div>

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