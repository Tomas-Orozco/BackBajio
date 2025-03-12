import pool from '../models/db.js';

export const crearComprobante = async (req, res) => {


  const { usuario_id, trimestre_id, cantidad, descripcion_documento, comentarios_adicionales } = req.body;


  const usuarioId = parseInt(usuario_id, 10);
  const trimestreId = parseInt(trimestre_id, 10);
  const cantidadNum = parseFloat(cantidad);

  if (!usuarioId || !trimestreId || isNaN(cantidadNum)) {
    return res.status(400).json({ mensaje: "Datos inválidos. Asegúrate de enviar usuario_id, trimestre_id y cantidad correctamente." });
  }

  
  const documento_pdf = req.files?.documento_pdf ? req.files.documento_pdf[0].filename : null;
  const documento_xml = req.files?.documento_xml ? req.files.documento_xml[0].filename : null;

  try {
    
    const [userResult] = await pool.query(
      `SELECT credito_asignado, total_credito FROM usuarios WHERE id = ?`,
      [usuarioId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    let { credito_asignado, total_credito } = userResult[0];

    // Obtener el último comprobante
    const [lastComprobante] = await pool.query(
      `SELECT trimestre_id FROM comprobantes WHERE usuario_id = ? ORDER BY fecha_subida DESC LIMIT 1`,
      [usuarioId]
    );

    const ultimo_trimestre = lastComprobante.length > 0 ? lastComprobante[0].trimestre_id : null;

    if (ultimo_trimestre !== trimestreId) {
      total_credito = credito_asignado;
    }

    // Calcular el nuevo total_credito
    const total_credito_actualizado = total_credito - cantidadNum;

    // Insertar nuevo comprobante con descripción y comentarios adicionales
    const [insertResult] = await pool.query(
      `INSERT INTO comprobantes 
      (usuario_id, trimestre_id, cantidad, total_credito, documento_pdf, documento_xml, descripcion_documento, comentarios_adicionales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, trimestreId, cantidadNum, total_credito_actualizado, documento_pdf, documento_xml, descripcion_documento, comentarios_adicionales]
    );

    console.log("✅ Comprobante insertado con ID:", insertResult.insertId);

    // Actualizar total_credito en `usuarios`
    await pool.query(
      `UPDATE usuarios SET total_credito = ? WHERE id = ?`,
      [total_credito_actualizado, usuarioId]
    );

    res.status(201).json({
      mensaje: "Comprobante guardado correctamente.",
      total_credito: total_credito_actualizado,
      documento_pdf,
      documento_xml,
      descripcion_documento,
      comentarios_adicionales
    });

  } catch (error) {
    console.error("🔥 Error al guardar comprobante:", error);
    res.status(500).json({ mensaje: error.message });
  }
};


export const obtenerComprobantes = async (req, res) => {
  const { usuarioId } = req.params;

  try {

    const [rows] = await pool.query(`
SELECT
    t.id AS trimestre_id,
    t.nombre AS trimestre_nombre,
    u.total_credito AS total_credito_asignado,

    -- Obtiene la cantidad del último comprobante de ese trimestre
    COALESCE((
        SELECT c2.cantidad
        FROM comprobantes c2
        WHERE c2.usuario_id = u.id
        AND c2.trimestre_id = t.id
        ORDER BY c2.id DESC
        LIMIT 1
    ), 0) AS monto_gastado,

    -- Calcula el porcentaje basado en el último monto gastado
    CASE 
        WHEN u.total_credito > 0 THEN 
            (COALESCE((
                SELECT c2.cantidad
                FROM comprobantes c2
                WHERE c2.usuario_id = u.id
                AND c2.trimestre_id = t.id
                ORDER BY c2.id DESC
                LIMIT 1
            ), 0) / u.total_credito) * 100
        ELSE 0
    END AS porcentaje,

    -- Si hay un comprobante en el trimestre, usa el total_credito de ese comprobante
    -- Si no hay comprobantes, usa el total_credito del usuario
    COALESCE((
        SELECT c2.total_credito
        FROM comprobantes c2
        WHERE c2.usuario_id = u.id
        AND c2.trimestre_id = t.id
        ORDER BY c2.id DESC
        LIMIT 1
    ), u.total_credito) AS total_credito_restante

FROM usuarios u
CROSS JOIN trimestres t
WHERE u.id = ?
ORDER BY t.id;


    `, [usuarioId]);

   
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener comprobantes resumidos por trimestre:', error);
    res.status(500).json({ mensaje: error.message });
  }
};
