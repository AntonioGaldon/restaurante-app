const API_URL = window.location.origin;

// =============================
// 🔹 VERIFICAR SESIÓN
// =============================

const usuarioJSON = localStorage.getItem('usuario');
if (!usuarioJSON) {
  alert('Debes iniciar sesión para ver tus pedidos');
  window.location.href = '/login.html';
}

const usuario = JSON.parse(usuarioJSON);

// =============================
// 🔹 CARGAR PEDIDOS
// =============================

const pedidosContainer = document.getElementById('pedidosContainer');

async function cargarPedidos() {
  try {
    const response = await fetch(`${API_URL}/pedidos/usuario/${usuario.id}`);
    if (!response.ok) throw new Error('Error al cargar pedidos');
    
    const pedidos = await response.json();
    
    pedidosContainer.innerHTML = '';
    
    if (pedidos.length === 0) {
      pedidosContainer.innerHTML = `
        <div class="no-pedidos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>No tienes pedidos</h2>
          <p>Cuando hagas tu primer pedido, aparecerá aquí</p>
          <button class="btn-primary" onclick="window.location.href='/'">Hacer un pedido</button>
        </div>
      `;
      return;
    }
    
    pedidos.forEach(pedido => {
      const estadoClass = {
        'En preparación': 'estado-preparacion',
        'Enviado': 'estado-enviado',
        'Entregado': 'estado-entregado',
        'Cancelado': 'estado-cancelado'
      }[pedido.estado] || 'estado-preparacion';
      
      const card = document.createElement('div');
      card.className = 'pedido-card';
      card.innerHTML = `
        <div class="pedido-header">
          <div>
            <div class="pedido-numero">Pedido #${pedido.pedido_id}</div>
            <div class="pedido-fecha">${pedido.fecha}</div>
          </div>
          <span class="pedido-estado ${estadoClass}">${pedido.estado}</span>
        </div>
        <div class="pedido-productos">${pedido.productos}</div>
        <div class="pedido-footer">
          <div class="pedido-total">${parseFloat(pedido.total).toFixed(2)} €</div>
        </div>
        <div class="pedido-direccion">📍 ${pedido.direccion}</div>
      `;
      pedidosContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    pedidosContainer.innerHTML = `
      <p class="loading" style="color:red;">Error al cargar tus pedidos</p>
    `;
  }
}

cargarPedidos();
