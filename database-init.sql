-- ==========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- ==========================================

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE restaurante;

-- Conectarse a la base de datos
-- \c restaurante

-- ==========================================
-- TABLA: clientes
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefono VARCHAR(20),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLA: productos
-- ==========================================
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  img TEXT,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLA: pedidos
-- ==========================================
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'En preparación',
  direccion TEXT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  alergenos TEXT,
  comentario TEXT,
  total DECIMAL(10,2)
);

-- ==========================================
-- TABLA: pedido_productos (relación muchos a muchos)
-- ==========================================
CREATE TABLE IF NOT EXISTS pedido_productos (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2)
);

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

-- Insertar clientes de prueba
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Cliente Prueba', 'cliente@example.com', '600000000', 'Calle Principal 123'),
('María García', 'maria@example.com', '611111111', 'Avenida Central 45')
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, img) VALUES
('Pizza Margarita', 'Pizza con tomate, mozzarella y albahaca', 8.50, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
('Pizza Pepperoni', 'Pizza con pepperoni y queso extra', 9.50, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'),
('Pizza Cuatro Quesos', 'Mezcla de quesos mozzarella, gouda, cheddar y parmesano', 10.00, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
('Hamburguesa Clásica', 'Carne de res, lechuga, tomate y queso', 6.75, 'Hamburguesa', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Hamburguesa Veggie', 'Hamburguesa con vegetales frescos', 7.25, 'Hamburguesa', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400'),
('Hamburguesa Doble', 'Doble carne con queso y bacon', 9.00, 'Hamburguesa', 'https://images.unsplash.com/photo-1551615593-ef5fe247e8f3?w=400'),
('Ensalada César', 'Lechuga, pollo, queso parmesano y aderezo César', 5.50, 'Ensaladas', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'),
('Ensalada Mixta', 'Mezcla de verduras frescas', 6.00, 'Ensaladas', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
('Tarta de Queso', 'Deliciosa tarta de queso con base de galleta', 4.50, 'Postres', 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400'),
('Brownie de Chocolate', 'Brownie de chocolate con nueces', 4.00, 'Postres', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),
('Coca-Cola', 'Refresco de cola 330ml', 2.00, 'Bebidas', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'),
('Agua Mineral', 'Agua mineral 500ml', 1.50, 'Bebidas', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400')
ON CONFLICT DO NOTHING;

-- ==========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_productos_pedido ON pedido_productos(pedido_id);