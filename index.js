import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuario.js';
import asesoresRoutes from './routes/asesores.js';
import comprobantesRoutes from './routes/comprobante.js';
import alertasRoutes from './routes/alerta.js';
import trimestresRoutes from './routes/trimestre.js';
import authRoutes from './routes/inicio.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

app.use('/usuarios', usuariosRoutes);
app.use('/asesores', asesoresRoutes);
app.use('/comprobantes', comprobantesRoutes);
app.use('/alertas', alertasRoutes);
app.use('/trimestres', trimestresRoutes);
app.use('/inicio', authRoutes);



const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
