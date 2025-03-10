import { Router } from 'express';
import { login } from '../controllers/inicioController.js';

const router = Router();

router.post('/', login);

export default router;
