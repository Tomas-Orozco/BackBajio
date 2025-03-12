import { Router } from 'express';
const router = Router();
import { obtenerComprobantes, crearComprobante } from '../controllers/comprobanteController.js';
import multer, { diskStorage } from 'multer';

const storage = diskStorage({
  destination: 'uploads/', // Carpeta donde se guardarán los archivos
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
});

router.get('/:usuarioId', obtenerComprobantes);

// Aquí corregimos el middleware para que espere los archivos correctos
router.post(
  '/crearComprobante',
  upload.fields([
    { name: "documento_pdf", maxCount: 1 },
    { name: "documento_xml", maxCount: 1 }
  ]),
  crearComprobante
);

export default router;
