// src/pages/UserProfile.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { User, Mail, Edit3, Trash2, Ticket, LogOut, Save, X } from 'lucide-react'
import './UserProfile.css'

const UserProfile = () => {
  const { user, logout, updateProfile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showDeleteTicketModal, setShowDeleteTicketModal] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  /*const [accountToDelete, setAccountToDelete] = useState(null)*/

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name }))
      fetchUserTickets()
    }
  }, [user])

  const fetchUserTickets = async () => {
    try {
      const response = await axios.get('/api/tickets/my-tickets')
      setTickets(response.data)
    } catch (err) {
      console.error('Errore nel caricamento dei biglietti:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    try {
      const updateData = { name: formData.name }
      if (formData.password) {
        updateData.password = formData.password
      }

      const result = await updateProfile(updateData)
      
      if (result.success) {
        setMessage('Profilo aggiornato con successo')
        setEditMode(false)
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Errore nell\'aggiornamento del profilo')
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setFormData(prev => ({ ...prev, name: user.name, password: '', confirmPassword: '' }))
    setError('')
    setMessage('')
  }

  const handleCancelTicket = (ticket) => {
    /*if (window.confirm('Sei sicuro di voler cancellare questo biglietto?')) {
      try {
        await axios.delete(`/api/tickets/${ticketId}/cancel`)
        setMessage('Biglietto cancellato con successo')
        // Ricarica la lista dei biglietti
        fetchUserTickets()
      } catch (err) {
        setError('Errore nella cancellazione del biglietto')
      }
    }*/
    setTicketToDelete(ticket)
    setShowDeleteTicketModal(true)
  }

  const confirmCancelTicket = async () => {

    if (!ticketToDelete) return

    try {
      await axios.delete(`/api/tickets/${ticketToDelete.id}/cancel`)
      setMessage('Biglietto cancellato con successo');
      fetchUserTickets();
    } catch (err) {
      setError('Errore nella cancellazione del biglietto')
    } finally {
      setShowDeleteTicketModal(false);
      setTicketToDelete(null);
    }

  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteAccount = /*async*/ () => {
    /*if (window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.')) {
      try {
        await axios.delete('/api/users/account')
        logout()
      } catch (err) {
        setError('Errore nell\'eliminazione dell\'account')
      }
    }*/
    setShowDeleteAccountModal(true)
  }

  const confirmDeleteAccount = async () => {
    try {
      await axios.delete('/api/users/account')
      logout()
    } catch (err) {
      setError('Errore nell\'eliminazioe dell\'account')
    }
  }

  if (!user) {
    return <div className="error">Utente non trovato</div>
  }

  return (
    <div className="user-profile">
      <div className="container">
        <div className="profile-header">
          <div className="user-avatar">
            <User size={40} />
          </div>
          <div className="user-info">
            <h1>Ciao, {user.name}!</h1>
            <p>Benvenuto nel tuo profilo personale</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Sezione Dati Personali */}
          <section className="profile-section">
            <div className="section-header">
              <h2>
                <User size={20} />
                I tuoi dati
              </h2>
              {!editMode && (
                <button 
                  onClick={() => setEditMode(true)}
                  className="btn btn-secondary"
                >
                  <Edit3 size={16} />
                  Modifica
                </button>
              )}
            </div>

            {editMode ? (
              <form className="edit-form">
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="disabled"
                  />
                  <small>L'email non può essere modificata</small>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Nuova password</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Lascia vuoto per non modificare"
                  />
                </div>

                {formData.password && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Conferma password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required={!!formData.password}
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" onClick={handleUpdateProfile} className="btn btn-primary">
                    <Save size={16} />
                    Salva modifiche
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                    <X size={16} />
                    Annulla
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-data">
                <div className="data-item">
                  <strong>Nome:</strong>
                  <span>{user.name}</span>
                </div>
                <div className="data-item">
                  <strong>Email:</strong>
                  <span>{user.email}</span>
                </div>
                {user.role === "admin" ?
                  <div className="data-item">
                    <strong>Ruolo:</strong>
                    <span className="role-badge">{user.role}</span>
                  </div>
                : null}
              </div>
            )}
          </section>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {/* Sezione Biglietti */}
          <section className="profile-section">
            <div className="section-header">
              <h2>
                <Ticket size={20} />
                I tuoi biglietti
              </h2>
            </div>

            {loading ? (
              <div className="loading">Caricamento biglietti...</div>
            ) : tickets.length > 0 ? (
              <>
                <div className="tickets-grid">
                  {tickets.map(ticket => {
                    // ✅ Calcoli JS qui dentro (fuori dal JSX)
                    const screeningTime = new Date(ticket.start_time);
                    const now = new Date();
                    const timeDiff = screeningTime - now; // differenza in millisecondi
                    const twoHours = 2 * 60 * 60 * 1000; // 2 ore in ms
                    const canCancel = (ticket.status === 'confirmed') && (timeDiff > twoHours); // true se mancano più di 2 ore

                    return (
                      <div key={ticket.id} className="ticket-card">
                        <div className="ticket-header">
                          <img 
                            src={ticket.foto_locandina || '/placeholder-movie.jpg'} 
                            alt={ticket.title}
                            className="ticket-poster"
                          />
                          <div className="ticket-main-info">
                            <h3>{ticket.title}</h3>
                            <div className="ticket-status">
                              <span className={`status-${ticket.status}`}>
                                {ticket.status === 'confirmed' ? 'Confermato' : 
                                 ticket.status === 'validated'? 'Convalidato' :
                                 ticket.status === 'cancelled'? 'Cancellato' : ticket.status}
                              </span>
                            </div>
                          </div>
                        </div>
                    
                        <div className="ticket-details">
                          <div className="detail-row">
                            <span className="detail-label">Sala:</span>
                            <span className="detail-value">{ticket.hall_name}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Data:</span>
                            <span className="detail-value">{formatDate(ticket.start_time)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Posto:</span>
                            <span className="detail-value">{ticket.seat_number}</span>
                          </div>
                        </div>

                        <div className="ticket-card-bottom">
                          {ticket.qr_code_url && (
                            <div className="ticket-qr-section">
                              <p className="qr-label">QR Code</p>
                              <img 
                                src={`http://localhost:3000${ticket.qr_code_url}`}
                                alt="QR Code"
                                className="qr-code"
                                onError={(e) => {
                                  console.error('Errore nel caricamento QR code:', ticket.qr_code_url);
                                  e.target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.textContent = 'QR Code non disponibile';
                                  fallback.className = 'qr-fallback';
                                  e.target.parentNode.appendChild(fallback);
                                }}
                                onLoad={(e) => {
                                  console.log('QR code caricato con successo:', ticket.qr_code_url);
                                }}
                              />
                            </div>
                          )}

                          <div className="ticket-actions">
                            <button 
                              onClick={() => handleCancelTicket(ticket)}
                              className="btn btn-danger btn-small"
                              disabled={!canCancel} 
                              /*title={!canCancel ? "Non puoi più cancellare questo biglietto" : ""}*/
                            >
                              <Trash2 size={14} />
                              Cancella Biglietto
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showDeleteTicketModal && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Conferma eliminazione</h3>
                      <p>Sei sicuro di voler eliminare il biglietto?</p>
                      <div className="modal-actions">
                        <button className="btn btn-primary-cancel" onClick={confirmCancelTicket}>Elimina</button>
                        <button className="btn btn-secondary-cancel" onClick={() => setShowDeleteTicketModal(false)}>Annulla</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-tickets">
                <Ticket size={48} />
                <h3>Nessun biglietto acquistato</h3>
                <p>Visita la sezione film per prenotare il tuo primo biglietto!</p>
              </div>
            )}
          </section>

          {/* Sezione Account */}
          <section className="profile-section danger-section">
            <div className="section-header">
              <h2>Gestione Account</h2>
            </div>
            
            <div className="account-actions">
              <button onClick={handleDeleteAccount} className="btn btn-danger">
                <Trash2 size={16} />
                Elimina account
              </button>
              
              <button onClick={logout} className="btn btn-secondary">
                <LogOut size={16} />
                Logout
              </button>
            </div>
            
            <div className="security-notice">
              <p>🛡️ <strong>Sicurezza:</strong> Il tuo account è protetto con crittografia avanzata.</p>
            </div>

            {showDeleteAccountModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Conferma eliminazione</h3>
                  <p>Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.</p>
                    <div className="modal-actions">
                      <button className="btn btn-primary-cancel" onClick={confirmDeleteAccount}>Elimina</button>
                      <button className="btn btn-secondary-cancel" onClick={() => setShowDeleteAccountModal(false)}>Annulla</button>
                    </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  )
}

export default UserProfile