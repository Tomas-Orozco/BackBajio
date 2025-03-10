import { Router } from 'express';
const router = Router();
import { obtenerUsuario, obtenerUsuarioPorId } from '../controllers/usuarioController.js';


router.get('/user/:id', obtenerUsuarioPorId);
router.get('/todos', obtenerUsuario);


export default router;
