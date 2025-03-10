import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/', // Carpeta donde se guardarán los archivos
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Evita nombres duplicados
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/xml', 'text/xml'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF y XML'), false);
  }
};


const upload = multer({ storage, fileFilter });

export default upload;
