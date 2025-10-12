// scripts/populateSeats.js
import { createSeatsForHall } from '../models/seatModel.js';

const populateSeats = async () => {
  try {
    console.log('🎯 Popolamento posti sale...');
    
    // Sala 1: 8 file (A-H) x 10 posti - Ultime 2 file (G,H) premium
    await createSeatsForHall(1, 8, 10);
    console.log('✅ Posti creati per Sala 1 (8x10) - File G,H premium');
    
    // Sala 2: 6 file (A-F) x 8 posti - Ultime 2 file (E,F) premium
    await createSeatsForHall(2, 6, 8);
    console.log('✅ Posti creati per Sala 2 (6x8) - File E,F premium');
    
    // Sala 3: 10 file (A-J) x 12 posti - Ultime 2 file (I,J) premium
    await createSeatsForHall(3, 10, 12);
    console.log('✅ Posti creati per Sala 3 (10x12) - File I,J premium');
    
    console.log('🎉 Tutti i posti sono stati creati!');
    console.log('💎 Le ultime due file di ogni sala sono PREMIUM');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
};

populateSeats();