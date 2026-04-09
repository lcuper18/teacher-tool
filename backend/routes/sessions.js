import { Router } from 'express';

const router = Router();

// Placeholder - will be implemented in Phase 2
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

router.get('/:id/download', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ error: 'Endpoint en desarrollo' });
});

export default router;