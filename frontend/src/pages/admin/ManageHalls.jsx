// src/pages/admin/ManageHalls.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Plus, Edit2, Trash2, Building, Users, Map } from 'lucide-react'
import './ManageHalls.css'

const ManageHalls = () => {
  const { user } = useAuth()
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHall, setEditingHall] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteHallModal, setShowDeleteHallModal] = useState(false)
  const [hallToDelete, setHallToDelete] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    hall_type: ''/*'Standard'*/,
    capacity: ''
  })

  useEffect(() => {
    fetchHalls()
  }, [])

  const fetchHalls = async () => {
    try {
      const response = await axios.get('/api/halls')
      setHalls(response.data)
    } catch (err) {
      setError('Errore nel caricamento delle sale')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingHall) {
        await axios.put(`/api/halls/${editingHall.id}`, formData)
        setSuccess('Sala aggiornata con successo')
      } else {
        await axios.post('/api/halls', formData)
        setSuccess('Sala aggiunta con successo')
      }

      resetForm()
      fetchHalls()
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio')
    }
  }

  const handleEdit = (hall) => {
    setEditingHall(hall)
    setFormData({
      name: hall.name,
      hall_type: hall.hall_type,
      capacity: hall.capacity
    })
    setShowForm(true)
  }

  const handleDelete = /*async*/ (hall) => {
    /*if (window.confirm('Sei sicuro di voler eliminare questa sala?')) {
      try {
        await axios.delete(`/api/halls/${hallId}`)
        setSuccess('Sala eliminata con successo')
        fetchHalls()
      } catch (err) {
        setError('Errore nell\'eliminazione della sala')
      }
    }*/
    setHallToDelete(hall)
    setShowDeleteHallModal(true)
  }

  const confirmDelete = async () => {

    if (!hallToDelete) return

    try {
      await axios.delete(`/api/halls/${hallToDelete.id}`)
      setSuccess('Sala eliminata con successo')
      fetchHalls()
    } catch (err) {
      setError('Errore nell\'eliminazione della sala')
    } finally {
      setShowDeleteHallModal(false)
      setHallToDelete(null)
    }

  }

  const resetForm = () => {
    setFormData({
      name: '',
      hall_type: ''/*'Standard'*/,
      capacity: ''
    })
    setEditingHall(null)
    setShowForm(false)
  }

  const generateSeats = async (hallId, hallName) => {
    const rows = prompt(`Quante file per ${hallName}?`);
    const columns = prompt(`Quanti posti per fila per ${hallName}?`);
    
    if (!rows || !columns) return;
    
    // Validazione input
    const numRows = parseInt(rows);
    const numColumns = parseInt(columns);
    
    if (isNaN(numRows) || isNaN(numColumns) || numRows <= 0 || numColumns <= 0) {
      setError('Inserisci numeri validi per file e colonne');
      return;
    }

    if (numRows > 20 || numColumns > 30) {
      setError('Numero di file o colonne troppo elevato (max: 20 file, 30 colonne)');
      return;
    }
    
    try {
      const response = await axios.post(`/api/halls/${hallId}/generate-seats`, {
        rows: numRows,
        columns: numColumns
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        // Ricarica la lista delle sale per mostrare i posti aggiornati
        fetchHalls();
      }
    } catch (err) {
      console.error('Errore generazione posti:', err);
      setError(err.response?.data?.error || 'Errore nella generazione dei posti');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="error">Accesso negato</div>
  }

  return (
    <div className="manage-halls">
      <div className="container">
        <div className="page-header">
          <h1>Gestisci Sale</h1>
          <p>Configura le sale e la disposizione dei posti</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="halls-header">
          <div className="header-info">
            <h2>Sale del Cinema</h2>
            <span className="count-badge">{halls.length} sale</span>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Nuova Sala
          </button>
        </div>

        {showForm && (
          <div className="hall-form-overlay">
            <div className="hall-form">
              <h2>{editingHall ? 'Modifica Sala' : 'Nuova Sala'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome Sala *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es: Sala 1, Sala IMAX..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo Sala *</label>
                    <select
                      value={formData.hall_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, hall_type: e.target.value }))}
                      required
                    >
                      <option value="Standard">Standard</option>
                      <option value="Imax">IMAX</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Capacità (posti) *</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="Numero totale di posti"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingHall ? 'Aggiorna Sala' : 'Crea Sala'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteHallModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Conferma eliminazione</h3>
              <p>Sei sicuro di voler eliminare <strong>{hallToDelete?.name}</strong>?</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={confirmDelete}>Elimina</button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteHallModal(false)}>Annulla</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Caricamento sale...</div>
        ) : (
          <div className="halls-grid">
            {halls.map(hall => (
              <div key={hall.id} className="hall-card">
                <div className="hall-header">
                  <div className="hall-icon">
                    <Building size={24} />
                  </div>
                  <div className="hall-info">
                    <h3>{hall.name}</h3>
                    <span className={`hall-type ${hall.hall_type.toLowerCase()}`}>
                      {hall.hall_type}
                    </span>
                  </div>
                </div>

                <div className="hall-details">
                  <div className="detail-item">
                    <Users size={16} />
                    <div className="detail-info">
                      <span className="detail-label">Capacità</span>
                      <span className="detail-value">{hall.capacity} posti</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Map size={16} />
                    <div className="detail-info">
                      <span className="detail-label">Configurazione</span>
                      <span className="detail-value">Posti standard</span>
                    </div>
                  </div>
                </div>

                <div className="hall-stats">
                  <div className="stat">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Proiezioni oggi</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">84%</span>
                    <span className="stat-label">Occupazione</span>
                  </div>
                </div>

                <div className="hall-actions">
                  <button 
                    onClick={() => generateSeats(hall.id, hall.name)}
                    className="btn-action generate"
                    >
                    <Map size={16} />
                    Genera Posti
                    </button>
                  <button 
                    onClick={() => handleEdit(hall)}
                    className="btn-action edit"
                  >
                    <Edit2 size={16} />
                    Modifica
                  </button>
                  <button 
                    onClick={() => handleDelete(hall)}
                    className="btn-action delete"
                  >
                    <Trash2 size={16} />
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {halls.length === 0 && !loading && (
          <div className="no-halls">
            <Building size={48} />
            <h3>Nessuna sala configurata</h3>
            <p>Crea la prima sala per iniziare</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageHalls