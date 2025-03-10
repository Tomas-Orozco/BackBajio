import { Router } from 'express';
import { obtenerAlertasUsuario, crearAlerta } from '../controllers/alertaController.js';

const router = Router();

router.get('/:usuarioId', obtenerAlertasUsuario);
router.post('/crearAlerta', crearAlerta);

export default router;
