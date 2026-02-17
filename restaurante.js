const API_URL = window.location.origin; // 🔥 Ahora usa el origen dinámicamente
const pedidosContainer = document.getElementById("pedidosContainer");
let estadoFiltro = "Todos";

// -----------------------------
// Botón Volver
// -----------------------------
document.getElementById("btnVolver").addEventListener("click", () => {
  window.history.back();
});

// -----------------------------
// FILTROS POR ESTADO
// -----------------------------
const botonesFiltro = document.querySelectorAll(".filtro-btn");
botonesFiltro.forEach(btn => {
  btn.addEventListener("click", () => {
    estadoFiltro = btn.dataset.estado;
    botonesFiltro.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    cargarPedidos();
  });
});

// -----------------------------
// CARGAR PEDIDOS
// -----------------------------
async function cargarPedidos() {
  try {
    const res = await fetch(`${API_URL}/pedidos`);
    if (!res.ok) throw new Error("Error al cargar pedidos");
    let pedidos = await res.json();

    // Filtrar por estado
    if (estadoFiltro !== "Todos") {
      pedidos = pedidos.filter(p => p.estado === estadoFiltro);
    }

    pedidosContainer.innerHTML = "";

    if (pedidos.length === 0) {
      pedidosContainer.innerHTML = "<p style='text-align:center; padding:20px;'>No hay pedidos en este estado.</p>";
      return;
    }

    pedidos.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("pedido");

      div.innerHTML = `
        <p><strong>Pedido #${p.pedido_id}</strong></p>
        <p><strong>Cliente:</strong> ${p.cliente}</p>
        <p><strong>Teléfono:</strong> ${p.telefono || 'N/A'}</p>
        <p><strong>Dirección:</strong> ${p.direccion || 'N/A'}</p>
        <p><strong>Productos:</strong> ${p.productos}</p>
        <p><strong>Total:</strong> ${parseFloat(p.total).toFixed(2)} €</p>
        ${p.alergenos ? `<p><strong>Alérgenos:</strong> ${p.alergenos}</p>` : ''}
        ${p.comentario ? `<p><strong>Comentario:</strong> ${p.comentario}</p>` : ''}
        <p><strong>Fecha:</strong> ${p.fecha}</p>
        <p><strong>Estado:</strong> <span class="estado">${p.estado}</span></p>
      `;

      // Botón cambiar estado
      const botonEstado = document.createElement("button");
      if (p.estado === "Entregado") {
        botonEstado.textContent = "Entregado ✅";
        botonEstado.classList.add("entregado");
        botonEstado.disabled = true;
      } else {
        botonEstado.textContent = "Marcar como Entregado";
        botonEstado.classList.add("en-preparacion");
        botonEstado.addEventListener("click", () => actualizarEstado(p.pedido_id, "Entregado"));
      }

      div.appendChild(botonEstado);
      pedidosContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Error al cargar pedidos:", err);
    pedidosContainer.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar pedidos. Verifica que el servidor esté corriendo.</p>";
  }
}

// -----------------------------
// ACTUALIZAR ESTADO PEDIDO
// -----------------------------
async function actualizarEstado(pedidoId, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
    cargarPedidos(); // Recargar lista después de actualizar
  } catch (err) {
    console.error("Error al actualizar estado:", err);
    alert("No se pudo actualizar el estado del pedido.");
  }
}

// -----------------------------
// INICIALIZAR
// -----------------------------
cargarPedidos();