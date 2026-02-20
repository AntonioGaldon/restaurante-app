// server.js - Versión corregida
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcrypt");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
// Configurar CORS y CSP
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.removeHeader('Content-Security-Policy');
  next();
});


// ===== RUTAS HTML =====
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "splash.html")));
app.get("/splash.html", (req, res) => res.sendFile(path.join(__dirname, "splash.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/home.html", (req, res) => res.sendFile(path.join(__dirname, "home.html")));
app.get("/carta.html", (req, res) => res.sendFile(path.join(__dirname, "carta.html")));
app.get("/admin.html", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));
app.get("/restaurante.html", (req, res) => res.sendFile(path.join(__dirname, "restaurante.html")));
app.get("/restaurante", (req, res) => res.sendFile(path.join(__dirname, "restaurante.html")));
app.get("/haptic.js", (req, res) => res.sendFile(path.join(__dirname, "haptic.js")));
app.get("/pull-to-refresh.js", (req, res) => res.sendFile(path.join(__dirname, "pull-to-refresh.js")));
app.get("/transitions.js", (req, res) => res.sendFile(path.join(__dirname, "transitions.js")));
app.get("/install-prompt.js", (req, res) => res.sendFile(path.join(__dirname, "install-prompt.js")));
app.get("/swipe-back.js", (req, res) => res.sendFile(path.join(__dirname, "swipe-back.js")));

// ===== ARCHIVOS ESTÁTICOS =====
// CSS / JS
app.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, "style.css")));
app.get("/login-style.css", (req, res) => res.sendFile(path.join(__dirname, "login-style.css")));
app.get("/login.js", (req, res) => res.sendFile(path.join(__dirname, "login.js")));
app.get("/home-style.css", (req, res) => res.sendFile(path.join(__dirname, "home-style.css")));
app.get("/home.js", (req, res) => res.sendFile(path.join(__dirname, "home.js")));
app.get("/carta.js", (req, res) => res.sendFile(path.join(__dirname, "carta.js")));
app.get("/admin.js", (req, res) => res.sendFile(path.join(__dirname, "admin.js")));
app.get("/admin.css", (req, res) => res.sendFile(path.join(__dirname, "admin.css")));
app.get("/restaurante.css", (req, res) => res.sendFile(path.join(__dirname, "restaurante.css")));
app.get("/restaurante.js", (req, res) => res.sendFile(path.join(__dirname, "restaurante.js")));
app.get("/manifest.json", (req, res) => res.sendFile(path.join(__dirname, "manifest.json")));
app.get("/service-worker.js", (req, res) => res.sendFile(path.join(__dirname, "service-worker.js")));

// IMÁGENES
app.get("/img/:filename", (req, res) => {
  const filePath = path.join(__dirname, "img", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: "Imagen no encontrada" });
  });
});

// ===== RUTAS API PRODUCTOS =====
app.get("/productos", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM productos ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("SELECT * FROM productos WHERE id=$1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

app.post("/productos", async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, subcategoria_id, img } = req.body;
    if (!nombre || !categoria || isNaN(precio))
      return res.status(400).json({ error: "Nombre, categoría y precio válido son obligatorios" });

    const result = await db.query(
      "INSERT INTO productos (nombre, descripcion, precio, categoria, subcategoria_id, img) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [nombre, descripcion || "", precio, categoria, subcategoria_id || null, img || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, descripcion, precio, categoria, subcategoria_id, img } = req.body;

    const result = await db.query(
      "UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, subcategoria_id=$5, img=$6 WHERE id=$7 RETURNING *",
      [nombre, descripcion || "", precio, categoria, subcategoria_id || null, img || "", id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/productos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("DELETE FROM productos WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// ===== RUTAS API PEDIDOS =====
app.get("/pedidos", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id AS pedido_id,
        c.nombre AS cliente,
        TO_CHAR(p.fecha, 'YYYY-MM-DD HH24:MI') AS fecha,
        STRING_AGG(pr.nombre || ' (x' || pp.cantidad || ')', ', ') AS productos,
        SUM(pp.cantidad * pr.precio) AS total,
        COALESCE(p.estado, 'En preparación') AS estado,
        p.direccion,
        p.telefono,
        p.alergenos,
        p.comentario
      FROM pedido_productos pp
      JOIN pedidos p ON pp.pedido_id = p.id
      JOIN clientes c ON p.cliente_id = c.id
      JOIN productos pr ON pp.producto_id = pr.id
      GROUP BY p.id, c.nombre, p.fecha, p.estado, p.direccion, p.telefono, p.alergenos, p.comentario
      ORDER BY p.id DESC;
    `);

    const pedidos = result.rows.map(p => ({
      ...p,
      estado: p.estado || "En preparación"
    }));

    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar pedidos" });
  }
});

app.post("/pedidos", async (req, res) => {
  const client = await db.connect();
  
  try {
   const { cliente_id, usuario_id, productos, alergenos, comentario, direccion, telefono } = req.body;

// Validaciones
if (!productos || productos.length === 0) {
  return res.status(400).json({ error: "Productos son obligatorios" });
}

// Usar usuario_id si existe, sino cliente_id (para compatibilidad)
const idCliente = usuario_id || cliente_id;

if (!idCliente) {
  return res.status(400).json({ error: "Debe proporcionar un usuario" });
}

    
    if (!direccion || !telefono) {
      return res.status(400).json({ error: "dirección y teléfono son obligatorios" });
    }
    
    await client.query("BEGIN");
    
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (cliente_id, fecha, estado, direccion, telefono, alergenos, comentario) 
       VALUES ($1, NOW(), $2, $3, $4, $5, $6) 
       RETURNING id`,
      [cliente_id, "En preparación", direccion, telefono, alergenos || null, comentario || null]
    );
    
    const pedido_id = pedidoResult.rows[0].id;
    
    for (const item of productos) {
      await client.query(
        "INSERT INTO pedido_productos (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)",
        [pedido_id, item.producto_id, item.cantidad]
      );
    }
    
    await client.query("COMMIT");
    
    res.status(201).json({
      message: "Pedido creado exitosamente",
      pedido_id: pedido_id
    });
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: "Error al crear el pedido" });
  } finally {
    client.release();
  }
});

app.put("/pedidos/:id/estado", async (req, res) => {
  try {
    const pedido_id = req.params.id;
    const { estado } = req.body;
    
    if (!estado)
      return res.status(400).json({ error: "Debes indicar el nuevo estado" });

    const result = await db.query(
      "UPDATE pedidos SET estado=$1 WHERE id=$2 RETURNING *",
      [estado, pedido_id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Pedido no encontrado" });

    res.json({ message: "Estado actualizado", pedido: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
});

// ===== RUTAS API CLIENTES =====
app.get("/clientes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clientes ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar clientes" });
  }
});

// ===== RUTAS API PROMOCIONES =====
app.get("/promociones", async (req, res) => {
  try {
    const mostrarTodas = req.query.all === 'true';
    const query = mostrarTodas 
      ? "SELECT * FROM promociones ORDER BY id DESC"
      : "SELECT * FROM promociones WHERE activa = true ORDER BY id DESC";
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar promociones" });
  }
});

app.post("/promociones", async (req, res) => {
  try {
    const { titulo, descripcion, precio, imagen, activa } = req.body;
    if (!titulo || !precio) {
      return res.status(400).json({ error: "Título y precio son obligatorios" });
    }
    const result = await db.query(
      "INSERT INTO promociones (titulo, descripcion, precio, imagen, activa) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [titulo, descripcion || "", precio, imagen || "", activa !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear promoción" });
  }
});

app.put("/promociones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagen, activa } = req.body;
    const result = await db.query(
      "UPDATE promociones SET titulo=$1, descripcion=$2, precio=$3, imagen=$4, activa=$5 WHERE id=$6 RETURNING *",
      [titulo, descripcion, precio, imagen, activa, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar promoción" });
  }
});

app.delete("/promociones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM promociones WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }
    res.json({ message: "Promoción eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar promoción" });
  }
});

app.put("/promociones/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE promociones SET activa = NOT activa WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

// ===== RUTAS API CATEGORÍAS =====
app.get("/categorias", async (req, res) => {
  try {
    const mostrarTodas = req.query.all === 'true';
    const query = mostrarTodas 
      ? "SELECT * FROM categorias ORDER BY orden, nombre"
      : "SELECT * FROM categorias WHERE activa = true ORDER BY orden, nombre";
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar categorías" });
  }
});

app.post("/categorias", async (req, res) => {
  try {
    const { nombre, icono, imagen, orden, activa } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    const result = await db.query(
      "INSERT INTO categorias (nombre, icono, imagen, orden, activa) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, icono || "📦", imagen || "", orden || 0, activa !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear categoría" });
  }
});

app.put("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, icono, imagen, orden, activa } = req.body;
    const result = await db.query(
      "UPDATE categorias SET nombre=$1, icono=$2, imagen=$3, orden=$4, activa=$5 WHERE id=$6 RETURNING *",
      [nombre, icono, imagen, orden, activa, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
});

app.delete("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM categorias WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

app.put("/categorias/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE categorias SET activa = NOT activa WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

// ===== RUTAS API SUBCATEGORÍAS =====
app.get("/subcategorias", async (req, res) => {
  try {
    const categoria_id = req.query.categoria_id;
    const mostrarTodas = req.query.all === 'true';
    
    let query = "SELECT * FROM subcategorias";
    let params = [];
    
    if (categoria_id) {
      query += " WHERE categoria_id = $1";
      params.push(categoria_id);
      if (!mostrarTodas) {
        query += " AND activa = true";
      }
    } else if (!mostrarTodas) {
      query += " WHERE activa = true";
    }
    
    query += " ORDER BY orden, nombre";
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar subcategorías" });
  }
});

app.post("/subcategorias", async (req, res) => {
  try {
    const { nombre, categoria_id, orden, activa } = req.body;
    if (!nombre || !categoria_id) {
      return res.status(400).json({ error: "Nombre y categoría son obligatorios" });
    }
    const result = await db.query(
      "INSERT INTO subcategorias (nombre, categoria_id, orden, activa) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, categoria_id, orden || 0, activa !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear subcategoría" });
  }
});

app.put("/subcategorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria_id, orden, activa } = req.body;
    const result = await db.query(
      "UPDATE subcategorias SET nombre=$1, categoria_id=$2, orden=$3, activa=$4 WHERE id=$5 RETURNING *",
      [nombre, categoria_id, orden, activa, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar subcategoría" });
  }
});

app.delete("/subcategorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM subcategorias WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }
    res.json({ message: "Subcategoría eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar subcategoría" });
  }
});

app.put("/subcategorias/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE subcategorias SET activa = NOT activa WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

// ===== RUTAS API AUTENTICACIÓN =====

// Registro de usuario
app.post("/auth/registro", async (req, res) => {
  try {
    const { email, password, nombre, telefono, direccion } = req.body;
    
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: "Email, contraseña y nombre son obligatorios" });
    }
    
    // Verificar si el email ya existe
    const usuarioExistente = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    
    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const result = await db.query(
      "INSERT INTO usuarios (email, password_hash, nombre, telefono, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, nombre, rol",
      [email, password_hash, nombre, telefono || null, direccion || null, 'cliente']
    );
    
    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login de usuario
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }
    
    // Buscar usuario
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    
    const usuario = result.rows[0];
    
    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: "Usuario desactivado" });
    }
    
    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    
    // Devolver datos del usuario (sin la contraseña)
    res.json({
      message: "Login exitoso",
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Obtener datos del usuario autenticado
app.get("/auth/me/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT id, email, nombre, telefono, direccion, rol FROM usuarios WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});


// ===== CONFIGURACIÓN SERVIDOR =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 Accede desde tu red local usando tu IP`);
});
