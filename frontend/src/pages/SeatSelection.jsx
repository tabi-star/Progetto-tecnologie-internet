// src/pages/SeatSelection.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { ArrowLeft, CreditCard, Ticket, X } from 'lucide-react'
import './SeatSelection.css'

const SeatSelection = () => {
  const { screeningId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [seats, setSeats] = useState([])
  const [screening, setScreening] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(null)
  const [discountError, setDiscountError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/seats/${screeningId}` } })
      return
    }
    fetchScreeningData()
    fetchAvailableSeats()
  }, [screeningId, user, navigate])

  const fetchScreeningData = async () => {
    try {
      const response = await axios.get(`/api/screenings/${screeningId}`)
      setScreening(response.data)
    } catch (err) {
      setError('Proiezione non trovata')
      console.error(err)
    }
  }

  const fetchAvailableSeats = async () => {
    try {
      const response = await axios.get(`/api/seats/screening/${screeningId}`)
      setSeats(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei posti')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSeatPrice = (seat) => {
    return seat.seat_type === 'premium' ? 10 : 7.50
  }

  const handleSeatClick = (seat) => {
    if (selectedSeats.some(s => s.seat_number === seat.seat_number)) {
      setSelectedSeats(selectedSeats.filter(s => s.seat_number !== seat.seat_number))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Inserisci un codice sconto')
      return
    }

    try {
      const response = await axios.post('/api/discounts/validate', { code: discountCode })
      if (response.data.valid) {
        setDiscountApplied({
          discount_percent: response.data.discount_percent,
          discount_id: response.data.discount_id
        })
        setDiscountError('')
        setError('')
      }
    } catch (err) {
      setDiscountError(err.response?.data?.error || 'Codice sconto non valido')
      setDiscountApplied(null)
    }
  }

  const removeDiscount = () => {
    setDiscountApplied(null)
    setDiscountCode('')
    setDiscountError('')
  }

  const calculateBaseTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + getSeatPrice(seat)
    }, 0)
  }

  const calculateDiscountAmount = () => {
    if (!discountApplied) return 0
    const baseTotal = calculateBaseTotal()
    return (baseTotal * discountApplied.discount_percent) / 100
  }

  const calculateFinalTotal = () => {
    const baseTotal = calculateBaseTotal()
    const discountAmount = calculateDiscountAmount()
    return baseTotal - discountAmount
  }

  

  const proceedToPayment = async () => {
    if (selectedSeats.length === 0) {
        setError('Seleziona almeno un posto')
        return
    }

    try {
        // Riserva i posti temporaneamente
        const seatNumbers = selectedSeats.map(seat => seat.seat_number)
        const reserveResponse = await axios.post('/api/tickets/reserve', {
        screening_id: parseInt(screeningId),
        seat_numbers: seatNumbers
        })

        if (reserveResponse.data.success) {
        // Passa ALL i dati necessari al Payment
        navigate('/payment', {
            state: {
            screening,
            selectedSeats,
            baseTotal: calculateBaseTotal(),
            discountApplied,
            finalTotal: calculateFinalTotal(),
            reservationData: reserveResponse.data,
            ticket_ids: reserveResponse.data.ticket_ids // IMPORTANTE!
            }
        })
        }
    } catch (err) {
        setError(err.response?.data?.error || 'Errore nella prenotazione')
    }
  }

  const getSeatStatus = (seat) => {
    if (selectedSeats.some(s => s.seat_number === seat.seat_number)) {
      return 'selected'
    }
    // Usa il campo status dal backend
    if (seat.status === 'occupied') {
      return 'occupied'
    }
    if (seat.status === 'reserved') {
      return 'occupied' // oppure puoi creare una classe 'reserved' se vuoi distinguerli
    }
    return 'available'
  }

  if (loading) return <div className="loading">Caricamento posti...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="seat-selection">
      <div className="container">
        {/* Header */}
        <div className="seat-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna indietro
          </button>
          
          {screening && (
            <div className="screening-info">
              <h1>{screening.title}</h1>
              <div className="screening-details">
                <span>{new Date(screening.start_time).toLocaleDateString('it-IT')}</span>
                <span>{new Date(screening.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>{screening.hall_name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="seat-layout">
          {/* Mappa Posti */}
          <div className="seat-map-container">
            <div className="screen-indicator">SCHERMO</div>
            
            <div className="seat-map">
              {seats.length > 0 ? (
                <div className="seats-grid">
                  {/* Raggruppa i posti per riga */}
                  {Object.entries(
                    seats.reduce((rows, seat) => {
                      if (!rows[seat.seat_row]) rows[seat.seat_row] = []
                      rows[seat.seat_row].push(seat)
                      return rows
                    }, {})
                  ).map(([row, rowSeats]) => (
                    <div key={row} className="seat-row">
                      <div className="row-label">{row}</div>
                      {rowSeats.map(seat => (
                        <button
                          key={seat.id}
                          className={`seat ${getSeatStatus(seat)} ${seat.seat_type}`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === 'occupied' || seat.status === 'reserved'}
                          title={`Posto ${seat.seat_number} - ${seat.seat_type === 'premium' ? 'Premium €10' : 'Standard €7.50'}${seat.status === 'occupied' ? ' - OCCUPATO' : seat.status === 'reserved' ? ' - RISERVATO' : ''}`}
                        >
                          {seat.seat_column}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-seats">Nessun posto disponibile</div>
              )}
            </div>

            {/* Legenda */}
            <div className="seat-legend">
              <div className="legend-item">
                <div className="seat available"></div>
                <span>Standard (€7.50)</span>
              </div>
              <div className="legend-item">
                <div className="seat selected"></div>
                <span>Selezionato</span>
              </div>
              <div className="legend-item">
                <div className="seat occupied"></div>
                <span>Occupato</span>
              </div>
              <div className="legend-item">
                <div className="seat premium"></div>
                <span>Premium (€10)</span>
              </div>
            </div>
          </div>

          {/* Riepilogo Ordine */}
          <div className="order-summary">
            <h3>Il tuo ordine</h3>
            
            <div className="selected-seats">
              <h4>Posti selezionati:</h4>
              {selectedSeats.length > 0 ? (
                <div className="seats-list">
                  {selectedSeats.map(seat => (
                    <div key={seat.seat_number} className="selected-seat">
                      <div className="seat-info">
                        <span className="seat-number">{seat.seat_number}</span>
                        <span className="seat-type">{seat.seat_type === 'premium' ? 'Premium' : 'Standard'}</span>
                        <span className="seat-price">€{getSeatPrice(seat)}</span>
                      </div>
                      <button 
                        onClick={() => handleSeatClick(seat)}
                        className="remove-seat"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-seats-message">Nessun posto selezionato</p>
              )}
            </div>

            {/* Codice Sconto */}
            <div className="discount-section">
              <h4>Codice sconto</h4>
              {discountApplied ? (
                <div className="discount-applied">
                  <div className="discount-success">
                    <span>🎉 Sconto {discountApplied.discount_percent}% applicato!</span>
                    <button onClick={removeDiscount} className="remove-discount">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="discount-input">
                  <input
                    type="text"
                    placeholder="Inserisci codice sconto"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyDiscount()}
                  />
                  <button 
                    onClick={applyDiscount}
                    disabled={!discountCode.trim()}
                    className="btn btn-secondary"
                  >
                    Applica
                  </button>
                </div>
              )}
              {discountError && <p className="discount-error">{discountError}</p>}
            </div>

            {/* Totale */}
            <div className="price-summary">
              <div className="price-breakdown">
                <h4>Dettaglio costo:</h4>
                
                {selectedSeats.map(seat => (
                  <div key={seat.seat_number} className="price-row">
                    <span>Posto {seat.seat_number} ({seat.seat_type})</span>
                    <span>€{getSeatPrice(seat).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="price-row subtotal">
                  <span>Subtotale</span>
                  <span>€{calculateBaseTotal().toFixed(2)}</span>
                </div>

                {discountApplied && (
                  <>
                    <div className="price-row discount">
                      <span>Sconto {discountApplied.discount_percent}%</span>
                      <span>-€{calculateDiscountAmount().toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="price-row total">
                <strong>Totale</strong>
                <strong>€{calculateFinalTotal().toFixed(2)}</strong>
              </div>
            </div>

            <button 
              onClick={proceedToPayment}
              disabled={selectedSeats.length === 0}
              className="btn btn-primary btn-payment"
            >
              <CreditCard size={20} />
              Procedi al pagamento (€{calculateFinalTotal().toFixed(2)})
            </button>

            <p className="security-note">
              🛡️ I tuoi posti saranno riservati per 2 minuti
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelection