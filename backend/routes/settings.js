import { Router } from 'express';

const router = Router();

// Placeholder - will be implemented in Phase 2
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

router.put('/', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

export default router;