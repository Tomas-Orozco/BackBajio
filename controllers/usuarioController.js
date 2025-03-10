import pool from '../models/db.js';

export async function obtenerUsuario(req, res) {
 

  try {
    const [usuarios] = await pool.query('SELECT id, nombre, correo, asesor_id FROM usuarios;');
    res.json(usuarios);
  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);
    res.status(500).json({ mensaje: error.message });
  }
}


export async function obtenerUsuarioPorId(req, res) {
  const { id } = req.params;
  

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
