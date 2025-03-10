import pool from '../models/db.js';

export const obtenerAsesores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, correo, telefono FROM asesores;');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};


export const obtenerAsesorPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.nombre, a.correo, a.telefono 
      FROM asesores a
      JOIN usuarios u ON u.asesor_id = a.id
      WHERE u.id = ?;`,
      [usuario_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Asesor no encontrado para este usuario." });
    }

    res.json(rows[0]); 
  } catch (error) {
    console.error("Error al obtener el asesor:", error);
    res.status(500).json({ mensaje: error.message });
  }
};
