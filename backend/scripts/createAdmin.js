// scripts/createAdmin.js
import bcrypt from 'bcryptjs'
import db from '../db.js'

const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = {
    name: 'Amministratore Cinema',
    email: 'admin@cinema.com',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date()
  }

  db.query('INSERT INTO users SET ?', adminUser, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('✅ Account admin già esistente')
      } else {
        console.error('❌ Errore creazione admin:', err)
      }
    } else {
      console.log('✅ Account admin creato con successo!')
      console.log('📧 Email: admin@cinema.com')
      console.log('🔑 Password: admin123')
      console.log('⚠️  CAMBIA LA PASSWORD APPENA POSSIBILE!')
    }
    process.exit()
  })
}

createAdminUser()