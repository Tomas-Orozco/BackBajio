import pool from '../models/db.js';

export const crearComprobante = async (req, res) => {
  console.log(" Body recibido:", req.body);
  console.log(" Archivos recibidos:", req.files);

  const { usuario_id, trimestre_id, cantidad } = req.body;

  const archivos = req.files || [];
  const documento_pdf = archivos.find(f => f.mimetype === 'application/pdf')?.filename || null;
  const documento_xml = archivos.find(f => f.mimetype.includes('xml'))?.filename || null;

  try {
  
    const [userResult] = await pool.query(
      `SELECT credito_asignado, total_credito FROM usuarios WHERE id = ?`,
      [usuario_id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    let { credito_asignado, total_credito } = userResult[0];

    const [lastComprobante] = await pool.query(
      `SELECT trimestre_id FROM comprobantes WHERE usuario_id = ? ORDER BY fecha_subida DESC LIMIT 1`,
      [usuario_id]
    );

    const ultimo_trimestre = lastComprobante.length > 0 ? lastComprobante[0].trimestre_id : null;

 
    if (ultimo_trimestre !== trimestre_id) {
      total_credito = credito_asignado;
    }

 
    const total_credito_actualizado = total_credito - parseFloat(cantidad);


    await pool.query(
      `INSERT INTO comprobantes (usuario_id, trimestre_id, cantidad, total_credito, documento_pdf, documento_xml)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, trimestre_id, cantidad, total_credito_actualizado, documento_pdf, documento_xml]
    );

    await pool.query(
      `UPDATE usuarios SET total_credito = ? WHERE id = ?`,
      [total_credito_actualizado, usuario_id]
    );

    res.status(201).json({ mensaje: 'Comprobante guardado correctamente.', total_credito: total_credito_actualizado });

  } catch (error) {
    console.error("🔥 Error al guardar comprobante:", error);
    res.status(500).json({ mensaje: error.message });
  }
};


export const obtenerComprobantes = async (req, res) => {
  const { usuarioId, trimestreId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM comprobantes WHERE usuario_id=? AND trimestre_id=?',
      [usuarioId, trimestreId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
