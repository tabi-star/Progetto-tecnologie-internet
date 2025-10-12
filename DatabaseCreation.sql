CREATE DATABASE IF NOT EXISTS cinema;
USE cinema;

-- Tabella users (esistente)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('client', 'admin') DEFAULT 'client',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella halls (esistente)
CREATE TABLE IF NOT EXISTS halls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hall_type ENUM('Standard', 'Imax') DEFAULT 'Standard',
  name VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella movies (esistente)
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  foto_locandina VARCHAR(255),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  release_date DATE,
  language ENUM('Italiano', 'Originale') DEFAULT 'Italiano',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella screenings (esistente)
CREATE TABLE IF NOT EXISTS screenings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  hall_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

-- Tabella tickets (AGGIORNATA)
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  screening_id INT NOT NULL,
  user_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  status ENUM('reserved', 'confirmed', 'cancelled') DEFAULT 'reserved',
  qr_code_url VARCHAR(500),
  price DECIMAL(8,2) DEFAULT 10.00,
  payment_id VARCHAR(100),
  reserved_until DATETIME,
  bookedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_seat (screening_id, seat_number)
);
-- Tabella seats (NUOVA - per mappa visiva)
CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hall_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_row CHAR(1) NOT NULL,
  seat_column INT NOT NULL,
  seat_type ENUM('standard', 'premium', 'disabled') DEFAULT 'standard',
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
  UNIQUE KEY unique_seat (hall_id, seat_number)
);

-- Tabella payments (NUOVA - tracciamento pagamenti)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  paypal_order_id VARCHAR(100),
  transaction_id VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Tabella codici sconto
CREATE TABLE IF NOT EXISTS discount_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INT NOT NULL,
  valid_until DATETIME NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  used_by INT NULL,
  used_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);