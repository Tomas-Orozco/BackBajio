import { Router } from 'express';
const router = Router();
import { obtenerTrimestres, crearTrimestre } from '../controllers/trimestreController.js';

router.get('/trimestre', obtenerTrimestres);
router.post('/crearTrimestre', crearTrimestre);


export default router;
