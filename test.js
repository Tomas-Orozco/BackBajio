import pool from './models/db.js';

async function testQuery() {
  try {
    const nombre = "Q2-2025";
    const anio = 2025;

    const [result] = await pool.query(
      'INSERT INTO trimestres (nombre, anio) VALUES (?, ?)',
      [nombre, anio]
    );

    console.log("✅ Trimestre creado con ID:", result.insertId);
  } catch (error) {
    console.error("🔥 Error en la base de datos:", error);
  }
}

testQuery();
