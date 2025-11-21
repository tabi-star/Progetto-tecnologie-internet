import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QrCode, CheckCircle, XCircle, Clock, User, Building, Film, Calendar } from 'lucide-react';
import axios from 'axios';
import './QRCodeScanner.css';

const QRCodeScanner = () => {
  const [qrText, setQrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const extractQRText = (input) => {
    if (input.includes('/qr-codes/')) {
      const filename = input.split('/qr-codes/')[1];
      return filename.replace('.png', '');
    }
    return input.replace('.png', '');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const cleanQRText = extractQRText(qrText);
      const response = await axios.post('/api/qr/verify', { qrText: cleanQRText });
      
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella verifica del QR code');
    } finally {
      setLoading(false);
    }
  }

  const handleValidateAndUse = async () => {
    if (!result) return;

    setLoading(true);

    try {

      const cleanQRText = extractQRText(qrText);
      const response = await axios.post('/api/qr/validate', { qrText: cleanQRText });
      
      if (response.data.success) {
        console.log(response.data)
        const hadConfirmed = result.tickets.some(t => t.status === "confirmed");

        const updatedTickets = result.tickets.map(ticket => {
          if (ticket.status === "confirmed") {
            return { ...ticket, status: "validated" };
          }
          return ticket;
        });

        setResult(prev => ({
          ...prev,
          tickets: updatedTickets,
          justValidated: hadConfirmed
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella validazione');
    } finally {
      setLoading(false);
    }

  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const resetForm = () => {
    setQrText('');
    setResult(null);
    setError('');
  }

  return (
    <div className="qr-scanner-page">
      <div className="container">
        <div className="qr-scanner-header">
          <QrCode size={48} />
          <h1>Scanner QR Code Biglietti</h1>
          <p>Verifica e convalida i biglietti del cinema</p>
        </div>

        {user?.role !== 'admin' && (
          <div className="warning-message">
            <XCircle size={20} />
            <span>Accesso riservato al personale autorizzato</span>
          </div>
        )}

        <div className="qr-scanner-content">
          <form onSubmit={handleVerify} className="qr-input-form">
            <div className="form-group">
              <label htmlFor="qrText">Codice QR Biglietto</label>
              <textarea
                id="qrText"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Incolla qui il testo del QR code o l'URL completo..."
                rows="3"
                disabled={loading || user?.role !== 'admin'}
                required
              />
              <small className="help-text">
                Esempio: ticket_12_1700000000000 o /qr-codes/ticket_12_1700000000000.png
              </small>
            </div>

            {error && (
              <div className="error-message">
                <XCircle size={20} />
                {error}
              </div>
            )}

            {result && (
              <div className="verification-result">
                {result.tickets.some(t => t.status === 'validated') && !result.justValidated ?
                  <div className="result-header already-validated">
                    <CheckCircle size={24} />
                    <h2>QR Code già convalidato</h2>
                    <span className="ticket-count">{result.tickets.length} {result.tickets.length > 1 ? 'biglietti' : 'biglietto'}</span>
                  </div>
                  :
                  result.tickets.every(t => t.status === 'cancelled') ?
                    <div className="result-header completely-cancelled">
                      <XCircle size={24} />
                      <h2>QR Code non valido</h2>
                      <span className="ticket-count">{result.tickets.length} {result.tickets.length > 1 ? 'biglietti' : 'biglietto'}</span>
                    </div> :
                  <div className="result-header success">
                    <CheckCircle size={24} />
                    <h2>QR Code valido</h2>
                    <span className="ticket-count">{result.tickets.length} {result.tickets.length > 1 ? 'biglietti' : 'biglietto'}</span>
                  </div>
                }

                <div className="tickets-info">
                  <div className="screening-summary">
                    <h3>
                      <Film size={20} />
                      {result.tickets[0]?.movie_title}
                    </h3>
                  
                    <div className="qr-screening-details">
                      <div className="qr-detail-row">
                        <div className="qr-detail-item">
                          <User size={18} />
                          <span><strong>Cliente:</strong> {result.tickets[0]?.user_name}</span>
                        </div>
                        <div className="qr-detail-item">
                          <Building size={18} />
                          <span><strong>Sala:</strong> {result.tickets[0]?.hall_name}</span>
                        </div>
                      </div>
                    
                      <div className="qr-detail-row">
                        <div className="qr-detail-item">
                          <Calendar size={18} />
                          <span><strong>Data:</strong> {formatDate(result.tickets[0]?.start_time)}</span>
                        </div>
                        <div className="qr-detail-item">
                          <Clock size={18} />
                          <span><strong>Ora:</strong> {formatTime(result.tickets[0]?.start_time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tickets-list">
                    <h4>Dettagli {result.tickets.length > 1 ? 'biglietti' : 'biglietto'}:</h4>
                    <div className="tickets-grid">
                      {result.tickets.map(ticket => (
                        <div key={ticket.id} className={`qr-scanner-ticket-card ${ticket.status}`}>
                          <div className="qr-scanner-ticket-header">
                            <span className="ticket-id">Biglietto #{ticket.id}</span>
                            <span className={`qr-status-badge ${ticket.status}`}>
                              {ticket.status === 'reserved' ? 'Prenotato' : 
                              ticket.status === 'confirmed' ? 'Confermato' :
                              ticket.status === 'validated' ? 'Convalidato' :
                              ticket.status === 'cancelled' ? 'Cancellato' : null}
                            </span>
                          </div>
                          <div className="qr-ticket-details">
                            <div className="detail">
                              <strong>Posto:</strong> {ticket.seat_number}
                            </div>
                            <div className="detail">
                              <strong>Prezzo:</strong> €{ticket.price}
                            </div>
                            <div className="detail">
                              <strong>Prenotato il:</strong> {formatDate(ticket.bookedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.tickets.some(t => t.status === 'confirmed') && (
                    <div className="validation-actions">
                      <button 
                        onClick={handleValidateAndUse}
                        className="btn btn-success btn-large"
                        disabled={loading}
                      >
                        {loading ? 'CONVALIDA...' : result.tickets.length > 1 ? 'CONVALIDA I BIGLIETTI' : 'CONVALIDA IL BIGLIETTO'}
                      </button>
                      <p className="help-text">
                        Clicca per convalidare i biglietti. Questa azione è irreversibile.
                      </p>
                    </div>
                  )}

                  {result.justValidated && (
                  <div className="just-used-message">
                    <span>✅ {result.tickets.length > 1 ? 'Biglietti appena convalidati' : 'Biglietto appena convalidato'} con successo!</span>
                  </div>
                  )}

                  {result.tickets.some(t => t.status === 'validated') && !result.justValidated && (
                    <div className="already-used-message">
                      <CheckCircle size={20} />
                      <span>{result.tickets.length > 1 ? 'Questi biglietti sono già stati convalidati' : 'Questo biglietto è già stato convalidato'}!</span>
                    </div>
                  )}

                  {result.tickets.every(t => t.status === 'cancelled') && (
                    <div className="completely-cancelled-message">
                      <XCircle size={20} />
                      <span>{result.tickets.length > 1 ? 'Questi biglietti sono stati cancellati' : 'Questo biglietto è stato cancellato'}!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="qr-form-actions">
              {!result && (
                <button 
                  type="submit" 
                  className="btn btn-primary-qr-check"
                  disabled={loading || !qrText || user?.role !== 'admin'}
                >
                  {loading ? 'Verifica in corso...' : 'Verifica QR Code'}
                </button>
              )}
              
              {result && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn btn-secondary-qr-check"
                >
                  Nuova Scansione
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;