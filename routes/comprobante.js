import { Router } from 'express';
const router = Router();
import { obtenerComprobantes, crearComprobante } from '../controllers/comprobanteController.js';
import multer, { diskStorage } from 'multer';

const storage = diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


router.get('/:usuarioId/:trimestreId', obtenerComprobantes);

router.post('/crearComprobante', upload.array('documentos', 2), crearComprobante);

export default router;
