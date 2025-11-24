-- =====================================================================
-- Script di reset del database "cinema"
-- Mantiene solo l'utente admin (id = 1) e svuota tutte le altre tabelle
-- =====================================================================

USE cinema;

-- 1) Disattivo i controlli di integrità referenziale
-- (serve per evitare errori durante il TRUNCATE di tabelle collegate da foreign key)
SET FOREIGN_KEY_CHECKS = 0;

-- 2) Svuoto le tabelle figlie prima delle tabelle padre
-- (ordine corretto per rispettare le dipendenze tra foreign key)
TRUNCATE TABLE payments;
TRUNCATE TABLE tickets;
TRUNCATE TABLE discount_codes;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE screenings;
TRUNCATE TABLE seats;
TRUNCATE TABLE movies;
TRUNCATE TABLE halls;
-- Attenzione! Questo commento eliminerà tutti gli utenti, compresi gli admin
TRUNCATE TABLE users;


-- 3) Elimino tutti gli utenti con ruolo "client" ma lascio gli admin
-- DELETE FROM users WHERE role = 'client';

-- 4) (Facoltativo ma consigliato)
-- Ripristino il contatore AUTO_INCREMENT a 2,
-- così il prossimo utente inserito avrà id = 2 (dato che l'admin è id = 1)
-- da usare preferibilmente quando è presente solo un admin nel DB:
-- ALTER TABLE users AUTO_INCREMENT = 2;
-- ALTERNATIVA: da usare quando ci sono più admin, i nuovi utenti avranno ID successivi all'ultimo admin
    /*SET @max_admin_id = (SELECT MAX(id) FROM users);
    SET @next_id = @max_admin_id + 1;
    SET @query = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @next_id);
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;*/

-- 5) Riattivo i controlli di integrità referenziale
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Fine script
-- =====================================================================
