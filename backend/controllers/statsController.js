import { getAdminStats } from '../models/statsModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getAdminStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Errore controller statistiche:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle statistiche'
    });
  }
};