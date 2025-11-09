// src/pages/admin/ManageHalls.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Plus, Edit2, Trash2, Building, Users, Map, Video } from 'lucide-react'
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
  const [showSeatModal, setShowSeatModal] = useState(false)
  const [hallLayouts, setHallLayouts] = useState({});
  const [screeningsCount, setScreeningsCount] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    hall_type: 'Standard',
    capacity: ''
  })

  const [seatConfig, setSeatConfig] = useState({
    hallId: null,
    hallName: '',
    rows: '',
    columns: ''
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

      let hallId = null
      let hallName = formData.name
      
      if (editingHall) {
        await axios.put(`/api/halls/${editingHall.id}`, formData)
        //setSuccess('Sala aggiornata con successo')
        hallId = editingHall.id
        hallName = editingHall.name
        /*setCapacityToBeSet(!capacityToBeSet)*/
      } else {
        const response = await axios.post('/api/halls', {
          ...formData,
          capacity: 0
        })
        // setSuccess('Sala aggiunta con success0')
        //console.log(response.data.hall)
        // const newHall = response.data
        hallId = response.data.hall.id
        hallName = response.data.hall.name
        // hallName = newHall.name
        /*setCapacityToBeSet(!capacityToBeSet)*/
      }

      if (hallId && hallName) {
        // generateSeats(hallId, hallName)
        setSeatConfig({ hallId, hallName, rows: '', columns: '' })
        setShowForm(false)
        setShowSeatModal(true)
      }

      // setSuccess(editingHall ? 'Sala aggiornata con successo' : 'Sala aggiunta con successo') DA USARE DOPO!

      /*if (!capacityToBeSet) {
        resetForm()
        fetchHalls()
      }*/
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio')
    }

  }

  const generateSeats = async (/*hallId, hallName*/) => {
    /*const rows = prompt(`Quante file per ${hallName}?`);
    const columns = prompt(`Quanti posti per fila per ${hallName}?`);*/
    const { hallId, hallName, rows, columns } = seatConfig

    const numRows = parseInt(rows)
    const numColumns = parseInt(columns)

    
    /*if (!rows || !columns) return;
    
    // Validazione input
    const numRows = parseInt(rows);
    const numColumns = parseInt(columns);*/
    
    if (isNaN(numRows) || isNaN(numColumns) || numRows <= 0 || numColumns <= 0) {
      setError('Inserisci numeri validi per file e colonne');
      return;
    }

    if (numRows > 20 || numColumns > 30) {
      setError('Numero di file o colonne troppo elevato (max: 20 file, 30 posti per fila)');
      return;
    }
    
    try {
      const response = await axios.post(`/api/halls/${hallId}/generate-seats`, {
        rows: numRows,
        columns: numColumns
      });
      
      const capacity = numRows * numColumns
      await axios.put(`/api/halls/${hallId}`, {
        ...formData,
        /*name: hallName,
        hall_type: formData.hall_type || "Stamdard",*/
        capacity
      })

      /*if (response.data.success) {
        setSuccess(response.data.message);*/
        /*setEditingHall({ hallId, hallName,  capacity: 0 })
        setCapacityToBeSet(!capacityToBeSet)
        handleSubmit(setFormData({ hallId, hallName, capacity: numRows*numColumns }))*/
        // Ricarica la lista delle sale per mostrare i posti aggiornati
        /*fetchHalls();*/
      /*}*/
      /*setSuccess(`Sala "${hallName}" aggiornata con ${capacity} posti`)*/
      setSuccess(editingHall? `${formData.name} da ${capacity} posti aggiornata con successo` : `${hallName} da ${capacity} posti creata con successo`)
      fetchHalls()
    } catch (err) {
      console.error('Errore generazione posti:', err);
      setError(err.response?.data?.error || 'Errore nella generazione dei posti');
    } finally {
        setShowSeatModal(false)
        setSeatConfig({ hallId: null, hallName: '', rows: '', columns: '' })
        resetForm()
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
      setSuccess(`${hallToDelete.name} eliminata con successo`)
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
      hall_type: /*''*/'Standard',
      capacity: ''
    })
    setEditingHall(null)
    setShowForm(false)
  }

  const getHallLayout = async (hallId) => {
    try {
      const res = await axios.get(`/api/seats/hall/${hallId}`); // endpoint che ritorna tutti i posti
      const seats = res.data;

      // Calcolo delle file e dei posti per fila
      const rowsMap = seats.reduce((rows, seat) => {
        if (!rows[seat.seat_row]) rows[seat.seat_row] = [];
        rows[seat.seat_row].push(seat);
        return rows;
      }, {});

      const totalRows = Object.keys(rowsMap).length;
      const maxSeatsPerRow = Math.max(...Object.values(rowsMap).map(rowSeats => rowSeats.length));

      // Salva nel state
      setHallLayouts(prev => ({
        ...prev,
        [hallId]: { totalRows, maxSeatsPerRow }
      }));
    } catch (err) {
      console.error(`Errore nel caricamento layout sala ${hallId}:`, err);
    }
  };

  useEffect(() => {
    // Appena caricate le sale, calcoliamo il layout per ciascuna
    if (halls.length > 0) {
      (async () => {
        for (const hall of halls) {
          await getHallLayout(hall.id); // una alla volta, evita sovraccarichi
        }
      })();
    }
  }, [halls]);

  const getScreeningCount = async (hallId) => {
    try {
      const response = await axios.get(`/api/screenings/count/${hallId}`);
      setScreeningsCount(prev => ({
        ...prev,
        [hallId]: response.data.count
      }));
    } catch (err) {
      console.error(`Errore nel caricamento delle proiezioni per la sala ${hallId}:`, err);
    }
  };

  useEffect(() => {
    if (halls.length > 0) {
      (async () => {
        for (const hall of halls) {
          await getScreeningCount(hall.id)
        }
      })();
    }
  }, [halls])

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

                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {/*{editingHall ? 'Aggiorna Sala' : 'Crea Sala'}*/}
                    Procedi
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSeatModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Genera posti per {seatConfig.hallName}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Numero di file</label>
                  <input
                    type="number"
                    value={seatConfig.rows}
                    onChange={(e) => setSeatConfig(prev => ({ ...prev, rows: e.target.value }))}
                    placeholder="Es: 10"
                  />
                </div>

                <div className="form-group">
                  <label>Posti per fila</label>
                  <input
                    type="number"
                    value={seatConfig.columns}
                    onChange={(e) => setSeatConfig(prev => ({ ...prev, columns: e.target.value }))}
                    placeholder="Es: 15"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={generateSeats}>
                  {/*Genera posti*/}
                  {editingHall ? 'Aggiorna Sala' : 'Crea Sala'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowSeatModal(false)}>
                  Annulla
                </button>
              </div>
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
                    <Users size={20} />
                    <div className="detail-info-capacity">
                      <span className="detail-label">Capacità:</span>
                      <span className="detail-value">{hall.capacity} posti</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Map size={20} />
                    <div className="detail-info-layout">
                      <span className="detail-label">Configurazione:</span>
                      {/*<span className="detail-value">Posti standard</span>*/}
                      <span className="detail-value">
                        {hallLayouts[hall.id]
                        ? `${hallLayouts[hall.id].totalRows} file • ${hallLayouts[hall.id].maxSeatsPerRow} posti per fila`
                        : "Caricamento..."}
                        {/*{hallLayouts[hall.id].totalRows} file <br />
                        {hallLayouts[hall.id].maxSeatsPerRow} posti per fila*/}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Video size={20} />
                    <div className="detail-info-screenings">
                      <span className="detail-label">Proiezioni oggi:</span>
                      <span className="detail-value">
                        {screeningsCount[hall.id] ? screeningsCount[hall.id] : '...'}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="hall-actions">
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