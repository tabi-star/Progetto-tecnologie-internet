import bcrypt from 'bcryptjs';
import readline from 'readline';
import { promisePool } from '../db.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createAdminUser = async () => {
  try {
    console.log('👤 Creazione Account Amministratore');
    console.log('='.repeat(40));
    
    const name = await askQuestion('Nome completo: ');
    const email = await askQuestion('Email: ');
    const password = await askQuestion('Password: ');
    const confirmPassword = await askQuestion('Conferma password: ');

    // Validazioni
    if (!name.trim()) {
      console.log('❌ Il nome è obbligatorio');
      rl.close();
      return;
    }

    if (!email.includes('@')) {
      console.log('❌ Email non valida');
      rl.close();
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Le password non coincidono');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('❌ La password deve essere di almeno 6 caratteri');
      rl.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Query per MariaDB
    const [result] = await promisePool.execute(
      'INSERT INTO users (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, 'admin', new Date()]
    );
    
    console.log('\n' + '='.repeat(40));
    console.log('ACCOUNT ADMIN CREATO CON SUCCESSO!');
    console.log('='.repeat(40));
    console.log(`📧 Email: ${email.trim().toLowerCase()}`);
    console.log(`👤 Nome: ${name.trim()}`);
    console.log(`🔐 Ruolo: Admin`);
    console.log(`🆔 ID: ${result.insertId}`);
    console.log('='.repeat(40));
    console.log('⚠️  Conserva queste credenziali in un luogo sicuro!');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('❌ ERRORE: Account già esistente con questa email');
    } else {
      console.error('❌ Errore durante la creazione:', error.message);
    }
  } finally {
    rl.close();
    process.exit();
  }
};

// Gestione CTRL+C
rl.on('SIGINT', () => {
  console.log('\n❌ Operazione annullata');
  rl.close();
  process.exit();
});

createAdminUser();