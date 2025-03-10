import { Router } from 'express';
const router = Router();
import { obtenerAsesores,obtenerAsesorPorUsuario } from '../controllers/asesorController.js';

router.get('/getasesor', obtenerAsesores);
router.get('/getAsesorusuario/:usuario_id', obtenerAsesorPorUsuario);


export default router;
