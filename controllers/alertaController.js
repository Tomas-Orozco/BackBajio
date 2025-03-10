import pool from '../models/db.js';

export const obtenerAlertasUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT alertas.*, asesores.nombre AS asesor_nombre
       FROM alertas
       INNER JOIN asesores ON alertas.asesor_id = asesores.id
       WHERE alertas.usuario_id = ?`,
      [usuarioId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};


export const crearAlerta = async (req, res) => {
  const { descripcion, asesor_id, usuario_id, trimestre_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO alertas (descripcion, asesor_id, usuario_id, trimestre_id)
       VALUES (?, ?, ?, ?)`,
      [descripcion, asesor_id, usuario_id, trimestre_id]
    );

    res.status(201).json({ mensaje: 'Alerta creada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
