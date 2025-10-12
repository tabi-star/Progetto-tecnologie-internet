import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { ArrowLeft, CreditCard, CheckCircle, Shield } from 'lucide-react'
import './Payment.css'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Ora riceviamo più dati dal SeatSelection
  const { 
    screening, 
    selectedSeats, 
    baseTotal, 
    discountApplied, 
    finalTotal, 
    reservationData 
  } = location.state || {}

  useEffect(() => {
    if (!screening || !selectedSeats || selectedSeats.length === 0) {
      navigate('/movies')
    }
  }, [screening, selectedSeats, navigate])

  // Calcola il prezzo per ogni posto
  const getSeatPrice = (seat) => {
    return seat.seat_type === 'premium' ? 15 : 10
  }

  // Calcola il totale base (senza sconto)
  const calculateBaseTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + getSeatPrice(seat)
    }, 0)
  }

  // Calcola l'importo dello sconto
  const calculateDiscountAmount = () => {
    if (!discountApplied) return 0
    const baseTotal = calculateBaseTotal()
    return (baseTotal * discountApplied.discount_percent) / 100
  }

  // Calcola il totale finale
  const calculateFinalTotal = () => {
    const baseTotal = calculateBaseTotal()
    const discountAmount = calculateDiscountAmount()
    return baseTotal - discountAmount
  }

  const handlePayment = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Usa il total finale calcolato
      const totalToPay = finalTotal || calculateFinalTotal()
      
      // Crea ordine di pagamento simulato
      const paymentResponse = await axios.post('/api/payments/create-order', {
        amount: totalToPay,
        ticket_ids: [] // Saranno creati dopo la conferma
      })

      // Simula il pagamento
      const captureResponse = await axios.post('/api/payments/capture-order', {
        orderID: paymentResponse.data.orderID
      })

      if (captureResponse.data.success) {
        // Prepara i dati per la conferma
        const confirmData = {
          ticket_ids: reservationData?.seats || [],
          paypal_order_id: paymentResponse.data.orderID
        }

        // Se c'è uno sconto applicato, aggiungi il discount_id
        if (discountApplied?.discount_id) {
          confirmData.discount_id = discountApplied.discount_id
        }

        // Conferma i biglietti
        const confirmResponse = await axios.post('/api/tickets/confirm-payment', confirmData)

        // Se c'è uno sconto, segnalo come utilizzato
        if (discountApplied?.discount_id) {
          try {
            await axios.post('/api/discounts/use', {
              discount_id: discountApplied.discount_id
            })
          } catch (discountErr) {
            console.error('Errore nell\'utilizzo dello sconto:', discountErr)
            // Non blocchiamo il pagamento se lo sconto fallisce
          }
        }

        setSuccess(true)
        
        // Reindirizza al profilo dopo 3 secondi
        setTimeout(() => {
          navigate('/profile')
        }, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel pagamento')
    } finally {
      setLoading(false)
    }
  }

  if (!screening || !selectedSeats) {
    return (
      <div className="error">
        Dati di prenotazione non validi
      </div>
    )
  }

  if (success) {
    const totalPaid = finalTotal || calculateFinalTotal()
    
    return (
      <div className="payment-success">
        <div className="container">
          <div className="success-content">
            <CheckCircle size={80} className="success-icon" />
            <h1>Pagamento Completato!</h1>
            <p>I tuoi biglietti sono stati confermati e inviati alla tua email</p>
            <div className="success-details">
              <p><strong>Film:</strong> {screening.title}</p>
              <p><strong>Posti:</strong> {selectedSeats.map(s => `${s.seat_number} (${s.seat_type})`).join(', ')}</p>
              <p><strong>Totale pagato:</strong> €{totalPaid.toFixed(2)}</p>
              {discountApplied && (
                <p><strong>Sconto applicato:</strong> {discountApplied.discount_percent}%</p>
              )}
            </div>
            <p className="redirect-message">
              Stai per essere reindirizzato al tuo profilo...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calcola i totali per il display
  const displayBaseTotal = baseTotal || calculateBaseTotal()
  const displayDiscountAmount = calculateDiscountAmount()
  const displayFinalTotal = finalTotal || calculateFinalTotal()

  return (
    <div className="payment-page">
      <div className="container">
        {/* Header */}
        <div className="payment-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Torna ai posti
          </button>
          <h1>Pagamento</h1>
        </div>

        <div className="payment-layout">
          {/* Riepilogo Ordine */}
          <div className="order-review">
            <h2>Riepilogo ordine</h2>
            
            <div className="movie-info">
              <img 
                src={screening.foto_locandina || '/placeholder-movie.jpg'} 
                alt={screening.title}
                className="movie-poster"
              />
              <div className="movie-details">
                <h3>{screening.title}</h3>
                <div className="screening-info">
                  <p><strong>Data:</strong> {new Date(screening.start_time).toLocaleDateString('it-IT')}</p>
                  <p><strong>Ora:</strong> {new Date(screening.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Sala:</strong> {screening.hall_name}</p>
                </div>
              </div>
            </div>

            <div className="seats-review">
              <h4>Posti selezionati:</h4>
              <div className="seats-list">
                {selectedSeats.map(seat => (
                  <div key={seat.seat_number} className="seat-item">
                    <span className="seat-number">{seat.seat_number}</span>
                    <span className="seat-type">{seat.seat_type === 'premium' ? 'Premium' : 'Standard'}</span>
                    <span className="seat-price">€{getSeatPrice(seat).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="price-breakdown">
              <h4>Dettaglio costo:</h4>
              
              {/* Dettaglio per ogni posto */}
              {selectedSeats.map(seat => (
                <div key={seat.seat_number} className="price-row item">
                  <span>Posto {seat.seat_number} ({seat.seat_type})</span>
                  <span>€{getSeatPrice(seat).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="price-row subtotal">
                <span>Subtotale</span>
                <span>€{displayBaseTotal.toFixed(2)}</span>
              </div>

              {discountApplied && (
                <div className="price-row discount">
                  <span>Sconto {discountApplied.discount_percent}%</span>
                  <span>-€{displayDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="price-row total">
                <strong>Totale da pagare</strong>
                <strong>€{displayFinalTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Metodo di Pagamento */}
          <div className="payment-method">
            <h2>Metodo di pagamento</h2>
            
            <div className="payment-card">
              <div className="payment-header">
                <CreditCard size={24} />
                <span>Pagamento sicuro</span>
                <Shield size={16} className="shield-icon" />
              </div>

              <div className="simulated-payment">
                <p>💳 <strong>Pagamento Simulato</strong></p>
                <p className="payment-note">
                  Questo è un pagamento di test. Non verrà addebitato alcun importo reale.
                </p>
              </div>

              <div className="user-info">
                <p><strong>Utente:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                {discountApplied && (
                  <p><strong>Sconto applicato:</strong> {discountApplied.discount_percent}%</p>
                )}
              </div>

              {error && <div className="error">{error}</div>}

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="btn btn-primary btn-pay"
              >
                {loading ? 'Processing...' : `Paga €${displayFinalTotal.toFixed(2)}`}
              </button>

              <div className="security-features">
                <div className="security-item">
                  <Shield size={16} />
                  <span>Pagamento sicuro SSL</span>
                </div>
                <div className="security-item">
                  <CheckCircle size={16} />
                  <span>Garanzia di rimborso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment