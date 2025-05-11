import express from 'express';
import { seedSubjects } from '../controllers/test.js';

const router = express.Router();

// Route: POST /api/subjects/seed
router.post('/seed', seedSubjects);

export default router;
