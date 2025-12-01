# 🎥 TRCinema - Piattaforma di Prenotazione Cinema

## Panoramica
Piattaforma completa per la gestione e prenotazione di biglietti cinematografici con sistema di pagamento, QR code e pannello amministrativo.

## Prerequisiti

### **Software Necessari:**
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [MariaDB](https://mariadb.org/) (v10.5+)
- [Git](https://git-scm.com/)

### **Account di Servizio:**
- Gmail account (per invio email)

## Configurazione Database MariaDB

### 1. **Installazione MariaDB**
```bash
# Linux
sudo apt update
sudo apt install mariadb-server

# macOS (con Homebrew)
brew install mariadb

# macOs (senza Homebrew)
- Scarica installer da: https://mariadb.org/download/

# Windows
- Scarica installer da: https://mariadb.org/download/
```

### 2. **Configurazione Iniziale**
```bash
# Avvia MariaDB
sudo systemctl start mariadb  # Linux
# oppure
brew services start mariadb   # macOS

## ulteriore alternativa macOS
- Per avviare/spegnere MariaDB: “mysql.server start”/“mysql.server stop”

# Sicurezza iniziale (Linux)
sudo mysql_secure_installation
```

### 3. **Creazione Database e Utente**
```sql
-- Accedi come root
mysql -u root -p

-- Crea database
CREATE DATABASE cinema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crea utente (sostituisci 'tuapassword' con una password sicura)
CREATE USER 'dbeaver'@'localhost' IDENTIFIED BY 'tuapassword';
GRANT ALL PRIVILEGES ON cinema.* TO 'dbeaver'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. **Import Schema (Opzionale)**
Se hai IL file SQL con lo schema:
```bash
mysql -u dbeaver cinema < DatabaseCreation.sql
```

## Configurazione Backend

### 1. **Clona e Installa Dipendenze**
```bash
# Clona repository
git clone cinema-project
# Spostarsi rispettivamente in
cd cinema-project/backend
cd cinema-project/frontend

# Ed Installare le dipendenze
npm install
```

### 2. **Configura Variabili Ambiente**
Crea file `.env` nella cartella `backend/`:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database MariaDB
DB_HOST=localhost
DB_USER=dbeaver
DB_PASS=
DB_NAME=cinema

# JWT Authentication
JWT_SECRET=ffc94555896e045ad6d2deead98b55fcf13a6f19695f6dd130f53a18c378ffd7     # Esempio di codice JWT
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_USER=(tuoemail)@gmail.com
APP_PASSWORD=          # Password app da Google Account
```

### 3. **Configurazione Gmail**
1. Vai su [Google Account](https://myaccount.google.com/)
2. Attiva "2-Step Verification"
3. Genera "App Password"
4. Usala in `APP_PASSWORD` nel `.env`

## Avvio Backend

### **Modalità Sviluppo (con auto-reload):**
```bash
npm run dev
```
    ## alternativa Linux/macOS/Windows (Windows solo tramite Git Bash, PowerShell o WSL)
    /backend: “./node_modules/.bin/nodemon server.js”

Output atteso:
```
🚀 Server avviato su http://localhost:3000
📧 Email configurata: ✅
🔐 JWT Secret: ✅
✅ Connesso al database MariaDB
```

### **Modalità Produzione:**
```bash
npm start
```

## Configurazione Frontend

### 1. **Installa Dipendenze**
```bash
cd ../frontend
npm install
```

### 2. **Configurazione Vite**
Il frontend usa Vite con proxy automatico verso il backend. Nessuna configurazione aggiuntiva necessaria se:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

### 3. **Avvio Frontend**
```bash
npm run dev
```
    ## alternativa Linux/macOS/Windows (Windows solo tramite Git Bash, PowerShell o WSL)
    /frontend: “./node_modules/.bin/vite”

Si apre automaticamente su: `http://localhost:3001`

## Scripts Utili Backend

### **Script di Amministrazione:**
```bash
# Crea account admin (eseguire dalla cartella madre /backend)
node scripts/createAdmin.js

# Output atteso:
👤 Creazione Account Amministratore
========================================
Nome completo: [inserisci nome]
Email: [inserisci email]
...
✅ ACCOUNT ADMIN CREATO CON SUCCESSO!
```

### **Comandi NPM Backend:**
```bash
npm run dev      # Avvio con nodemon (sviluppo)
npm start        # Avvio produzione
```

### **Comandi NPM Frontend:**
```bash
npm run dev      # Avvio Vite dev server
npm run build    # Build produzione
npm run preview  # Preview build
```

## Struttura API Endpoints

### **Backend API (http://localhost:3000):**
```
GET    /api/movies              # Lista film
POST   /api/movies              # Aggiungi film
GET    /api/screenings          # Proiezioni
POST   /api/tickets/reserve     # Prenota posti
POST   /api/tickets/confirm     # Conferma pagamento
GET    /api/users/my-tickets    # Biglietti utente
POST   /api/discounts/generate  # Genera sconti
GET    /api/qr/verify           # Verifica QR code
```

### **Health Check:**
```
GET    http://localhost:3000
```
✅ Risposta: `{"message": "🎥 🎬 TRCinema attiva", "version": "1.0.0"}`

## Risoluzione Problemi

### **Database Connection Error:**
```bash
# Verifica se MariaDB è attivo
sudo systemctl status mariadb

# Test connessione manuale
mysql -u dbeaver -h localhost cinema

# Se necessario, ricrea utente
mysql -u root -p
DROP USER 'dbeaver'@'localhost';
CREATE USER 'dbeaver'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON cinema.* TO 'dbeaver'@'localhost';
FLUSH PRIVILEGES;
```

### **Email Configuration Error:**
1. Verifica `EMAIL_USER` nel `.env`
2. Assicurati di aver generato "App Password"
3. Controlla che 2FA sia attivo su Google Account

### **Port Already in Use:**
```bash
# Trova processo sulla porta 3000
lsof -i :3000

# Kill processo
kill -9 <PID>
```

## 📁 Struttura Progetto

```
cinema-project/
│
├── backend/
│   │
│   ├── controllers/        # Logica business
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Autenticazione/validazione
│   ├── services/           # Servizi (email, QR code, pagamento)
│   ├── scripts/            # Script utilità
│   ├── public/             # File statici
│   ├── node_modules/       # Pacchetti di Node installati per il backend
│   ├── .env                # Variabili ambiente
│   ├── server.js           # Entry point
│   ├── db.js               # Configurazione database
│   ├── package.json        # Pacchetti di Node da installare con il comando "npm install"
│   └── package-lock.json   # Definisce la versione dei pacchetti di Node da installare con il comando "npm install"
│
├── frontend/
│   │
│   ├── public/             # Logo Vite e placeholder per i film
│   │
│   ├── src/
│   │   ├── assets/         # Logo React
│   │   ├── components/     # Componenti che hanno effetti in tutte le pagine
│   │   ├── pages/          # Componenti pagina
│   │   ├── contexts/       # React context
│   │   ├── App.jsx         # App principale
│   │   ├── index.css       # Stili di elementi globali presenti in tutto il sito
│   │   └── main.jsx        # Inizializza React e monta l'app nell'elemento root
│   │
│   ├── node_modules/       # Pacchetti di Node installati per il frontend
│   │
│   ├── vite.config.js      # Configurazione Vite
│   ├── index.html          # Entry point del frontend
│   ├── README.md           # Descrizione del template per React con Vite, con supporto HMR e configurazioni ESLint
│   ├── eslint.config.js    # Configurazione ESLint
│   ├── .gitignore          # File contenente cosa non deve essere caricato su Git
│   ├── package.json        # Pacchetti di Node da installare con il comando "npm install"
│   └── package-lock.json   # Definisce la versione dei pacchetti di Node da installare con il comando "npm install"
│
├── README.md               # Questo file
├── DatabaseCreation.sql    # Script per creare il database
├── Script_CleanDB.sql      # Script per pulire il database
└── .gitignore              # File contenente cosa non deve essere caricato su Git
```

## 🌟 Feature Principali

1. **🎬 Prenotazione Posti** - Selezione interattiva posti
2. **💳 Pagamento Sicuro** - Sistema pagamento simulato
3. **📱 QR Code Tickets** - Biglietti digitali
4. **👨‍💼 Admin Dashboard** - Gestione completa
5. **📧 Notifiche Email** - Conferme automatiche
6. **🎟️ Codici Sconto** - Sistema sconti personalizzati

## 📞 Supporto

Per problemi:
1. Verifica log backend (`npm run dev`)
2. Controlla console browser
3. Verifica connessione database
4. Controlla variabili `.env`

---

**La tua piattaforma cinema è pronta!**