import pool from '../models/db.js';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 

export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    
    const [userResult] = await pool.query(
      `SELECT id, nombre, correo, password FROM usuarios WHERE correo = ?`,
      [correo]
    );

    if (userResult.length === 0) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const usuario = userResult[0];


    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }


    const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, "secreto", {
      expiresIn: "2h",
    });

  
    res.json({
      mensaje: "Inicio de sesión exitoso",
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      token
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};
