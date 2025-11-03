-- =====================================================================
-- Script di reset del database "cinema"
-- Mantiene solo l'utente admin e svuota tutte le altre tabelle
-- =====================================================================

USE cinema;

-- 1️⃣ Disattivo i controlli di integrità referenziale
-- (serve per evitare errori durante il TRUNCATE di tabelle collegate da foreign key)
SET FOREIGN_KEY_CHECKS = 0;

-- 2️⃣ Svuoto le tabelle figlie prima delle tabelle padre
-- (ordine corretto per rispettare le dipendenze tra foreign key)
TRUNCATE TABLE payments;
TRUNCATE TABLE tickets;
TRUNCATE TABLE discount_codes;
TRUNCATE TABLE screenings;
TRUNCATE TABLE seats;
TRUNCATE TABLE movies;
TRUNCATE TABLE halls;
TRUNCATE TABLE password_reset_tokens;

-- 3️⃣ Elimino tutti gli utenti con ruolo "client" ma lascio gli admin
DELETE FROM users WHERE role = 'client';

-- 4️⃣ (Facoltativo ma consigliato)
-- Ripristino il contatore AUTO_INCREMENT a 2,
-- così il prossimo utente inserito avrà id = 2 (dato che l'admin è id = 1)
ALTER TABLE users AUTO_INCREMENT = 2;

-- 5️⃣ Riattivo i controlli di integrità referenziale
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Fine script
-- =====================================================================
