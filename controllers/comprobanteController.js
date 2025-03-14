import pool from '../models/db.js'; 

export const crearComprobante = async (req, res) => {


  const { usuario_id, trimestre_id, cantidad_factura, descripcion, comentarios_adicionales } = req.body;


  const usuarioId = parseInt(usuario_id, 10);
  const trimestreId = parseInt(trimestre_id, 10);
  const cantidadNum = parseFloat(cantidad_factura);

  if (!usuarioId || !trimestreId || isNaN(cantidadNum)) {
    return res.status(400).json({ mensaje: "Datos inválidos. Asegúrate de enviar usuario_id, trimestre_id y cantidad correctamente." });
  }

  
  const documento_pdf = req.files?.documento_pdf ? req.files.documento_pdf[0].filename : null;
  const documento_xml = req.files?.documento_xml ? req.files.documento_xml[0].filename : null;

  try {
    
    const [userResult] = await pool.query(
      'SELECT credito_asignado, total_credito FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    let { credito_asignado, total_credito } = userResult[0];

    
    const [lastComprobante] = await pool.query(
      'SELECT trimestre_id FROM comprobantes WHERE usuario_id = ? ORDER BY fecha_subida DESC LIMIT 1',
      [usuarioId]
    );

    const ultimo_trimestre = lastComprobante.length > 0 ? lastComprobante[0].trimestre_id : null;

    if (ultimo_trimestre !== trimestreId) {
      total_credito = credito_asignado;
    }

    
    const total_credito_actualizado = total_credito - cantidadNum;

    
    const [insertResult] = await pool.query(
      `INSERT INTO comprobantes 
      (usuario_id, trimestre_id, cantidad_factura, total_credito, documento_pdf, documento_xml, descripcion, comentarios_adicionales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, trimestreId, cantidadNum, total_credito_actualizado, documento_pdf, documento_xml, descripcion, comentarios_adicionales]
    );

    console.log("Comprobante insertado con ID:", insertResult.insertId);


    await pool.query(
      'UPDATE usuarios SET total_credito = ? WHERE id = ?',
      [total_credito_actualizado, usuarioId]
    );

    res.status(201).json({
      mensaje: "Comprobante guardado correctamente.",
      total_credito: total_credito_actualizado,
      documento_pdf,
      documento_xml,
      descripcion,
      comentarios_adicionales
    });

  } catch (error) {
    console.error(" Error al guardar comprobante:", error);
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
    
    -- Crédito total ASIGNADO al usuario desde la tabla de usuarios
    u.total_credito AS total_credito_asignado,

    -- Obtiene la suma total de los comprobantes del trimestre correspondiente
    COALESCE((
        SELECT SUM(c2.cantidad_factura)
        FROM comprobantes c2
        WHERE c2.usuario_id = u.id
        AND c2.trimestre_id = t.id
    ), 0) AS monto_gastado,

    -- Calcula el porcentaje gastado correctamente usando SOLO el crédito asignado de usuarios
    CASE 
        WHEN u.total_credito > 0 THEN 
            (COALESCE((
                SELECT SUM(c2.cantidad_factura)
                FROM comprobantes c2
                WHERE c2.usuario_id = u.id
                AND c2.trimestre_id = t.id
            ), 0) / u.total_credito) * 100
        ELSE 0
    END AS porcentaje,

    -- Calcula el crédito restante restando SOLO los gastos de ese trimestre
    (u.total_credito - COALESCE((
        SELECT SUM(c2.cantidad_factura)
        FROM comprobantes c2
        WHERE c2.usuario_id = u.id
        AND c2.trimestre_id = t.id
    ), 0)) AS total_credito_restante

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
