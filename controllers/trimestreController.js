import pool from '../models/db.js';

export async function obtenerTrimestres(req, res) {
  const [rows] = await pool.query('SELECT id, nombre, anio FROM trimestres ORDER BY anio DESC, nombre ASC;');
  res.json(rows);
}

export async function crearTrimestre(req, res) {
  try {
    console.log("Body recibido:", req.body); 

    const { nombre, anio } = req.body;

    if (!nombre || !anio) { 
      console.log(req.body)
      return res.status(400).json({ mensaje: "El nombre y el año son obligatorios." });
    }

    const [result] = await pool.query(
      'INSERT INTO trimestres (nombre, anio) VALUES (?, ?)',[nombre, anio]);

    res.status(201).json({ id: result.insertId, nombre, anio });

  } catch (error) {
    console.error("Error al crear trimestre:", error);
    res.status(500).json({ mensaje: error.message });
  }
}
