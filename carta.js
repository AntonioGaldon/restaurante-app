// =============================
// 📌 CONFIGURACIÓN API
// =============================
const API_URL = window.location.origin;

// =============================
// 📌 VARIABLES
// =============================
let productos = [];
let carrito = [];
const productosContainer = document.getElementById("productosContainer");
const carritoItems = document.getElementById("carritoItems");
const totalCarrito = document.getElementById("totalCarrito");
const totalCarritoFloat = document.getElementById("totalCarritoFloat");
const finalizarPedido = document.getElementById("finalizarPedido");
const filtrosContainer = document.getElementById("filtros");

// Modal pedido
const pedidoModal = document.getElementById("pedidoModal");
const cancelarPedido = document.getElementById("cancelarPedido");
const confirmarPedido = document.getElementById("confirmarPedido");
const alergenosInput = document.getElementById("alergenos");
const comentarioPedidoInput = document.getElementById("comentarioPedido");
const direccionEntregaInput = document.getElementById("direccionEntrega");
const telefonoContactoInput = document.getElementById("telefonoContacto");

// Modal upsell
const upsellModal = document.getElementById("upsellModal");
const btnSaltarUpsell = document.getElementById("saltarUpsell");
const btnContinuarUpsell = document.getElementById("continuarUpsell");

// Botón flotante y contador
const carritoFlotante = document.getElementById("carritoFlotante");
const cantidadCarritoBtn = document.getElementById("cantidadCarrito");
const carritoSheet = document.getElementById("carritoSheet");

// Usuario logueado
let usuarioJSON = null;
let usuario = null;

// =============================
// 🔹 CARGAR PRODUCTOS DESDE API
// =============================
async function cargarProductosDesdeAPI() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error("Error al cargar productos");
    productos = await response.json();
    
    if (productos.length === 0) {
      productosContainer.innerHTML = "<p class='loading'>No hay productos disponibles.</p>";
      return;
    }
    
    await generarFiltros();

    // Cargar productos de la categoría si viene en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaURL = urlParams.get('categoria');
    renderProductos(categoriaURL || "Todas", null);

  } catch (error) {
    console.error("Error cargando productos:", error);
    productosContainer.innerHTML = "<p class='loading' style='color:red;'>Error al cargar productos.</p>";
  }
}

// =============================
// 🔹 GENERAR FILTROS
// =============================
async function generarFiltros() {
  filtrosContainer.innerHTML = "";
  
  // Obtener categoría de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoriaURL = urlParams.get('categoria');
  
  if (categoriaURL) {
    // Buscar el ID de la categoría
    const resCat = await fetch(`${API_URL}/categorias?all=true`);
    const categorias = await resCat.json();
    const categoria = categorias.find(c => c.nombre === categoriaURL);
    
    if (categoria) {
      // Cargar subcategorías de esta categoría
      const resSub = await fetch(`${API_URL}/subcategorias?categoria_id=${categoria.id}`);
      const subcategorias = await resSub.json();
      
      if (subcategorias.length > 0) {
        // Botón "Todas"
        const btnTodas = document.createElement("button");
        btnTodas.textContent = "Todas";
        btnTodas.classList.add("active");
        btnTodas.addEventListener("click", () => {
          document.querySelectorAll("#filtros button").forEach(b => b.classList.remove("active"));
          btnTodas.classList.add("active");
          renderProductos(categoriaURL, null);
        });
        filtrosContainer.appendChild(btnTodas);
        
        // Botones de subcategorías
        subcategorias.forEach(sub => {
          const btn = document.createElement("button");
          btn.textContent = sub.nombre;
          btn.addEventListener("click", () => {
            document.querySelectorAll("#filtros button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProductos(categoriaURL, sub.id);
          });
          filtrosContainer.appendChild(btn);
        });
        
        return;
      }
    }
  }
  
  // Si no hay subcategorías ni productos en esta categoría, mostrar solo "Todas"
  if (categoriaURL) {
    const productosDeLaCategoria = productos.filter(p => p.categoria === categoriaURL);
    
    if (productosDeLaCategoria.length === 0) {
      // No hay productos, no mostrar filtros
      filtrosContainer.innerHTML = "";
      return;
    }
    
    // Hay productos pero sin subcategorías, mostrar solo "Todas"
    const btnTodas = document.createElement("button");
    btnTodas.textContent = "Todas";
    btnTodas.classList.add("active");
    filtrosContainer.appendChild(btnTodas);
  } else {
    // Pantalla general: mostrar categorías que tienen productos
    const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))];
    categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      if (cat === "Todas") btn.classList.add("active");
      btn.addEventListener("click", () => {
        const botonesActivos = filtrosContainer.querySelectorAll("button");
        botonesActivos.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProductos(cat, null);
      });
      filtrosContainer.appendChild(btn);
    });
  }
}

// =============================
// 🔹 RENDER PRODUCTOS
// =============================
function renderProductos(categoria = "Todas", subcategoria_id = null) {
  productosContainer.innerHTML = "";
  
  let filtrados = productos;
  
  // Filtrar por categoría
  if (categoria !== "Todas") {
    filtrados = filtrados.filter(p => p.categoria === categoria);
  }
  
  // Filtrar por subcategoría si existe
  if (subcategoria_id) {
    filtrados = filtrados.filter(p => p.subcategoria_id === subcategoria_id);
  }
  
  if (filtrados.length === 0) {
    productosContainer.innerHTML = "<p class='loading'>No hay productos en esta categoría.</p>";
    return;
  }
  
  filtrados.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");
    const imgUrl = p.img || "https://via.placeholder.com/100x100?text=Sin+Imagen";
    card.innerHTML = `
      <img src="${imgUrl}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/100x100?text=Sin+Imagen'">
      <div class="card-content">
        <div>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion || ''}</p>
          <strong>${parseFloat(p.precio).toFixed(2)} €</strong>
        </div>
        <div class="acciones">
          <button class="agregarBtn">Agregar</button>
          <div class="contador"></div>
        </div>
      </div>`;
    productosContainer.appendChild(card);
    const agregarBtn = card.querySelector(".agregarBtn");
    agregarBtn.addEventListener("click", () => {
      agregarAlCarrito(p.id);
      renderCardContador(card, p.id);
    });
    renderCardContador(card, p.id);
  });
}

// =============================
// 🔹 CONTADOR EN CARD
// =============================
function renderCardContador(card, productoId) {
  const accionesDiv = card.querySelector(".acciones");
  const agregarBtn = accionesDiv.querySelector(".agregarBtn");
  const contadorDiv = accionesDiv.querySelector(".contador");
  const cantidad = carrito.find(i => i.id === productoId)?.cantidad || 0;
  contadorDiv.innerHTML = "";
  if (cantidad === 0) {
    agregarBtn.style.display = "block";
    contadorDiv.style.display = "none";
  } else {
    agregarBtn.style.display = "none";
    contadorDiv.style.display = "flex";
    const menosBtn = document.createElement("button");
    menosBtn.textContent = cantidad === 1 ? "🗑" : "-";
    menosBtn.onclick = () => { quitarDelCarrito(productoId); renderCardContador(card, productoId); };
    const span = document.createElement("span");
    span.textContent = cantidad;
    const masBtn = document.createElement("button");
    masBtn.textContent = "+";
    masBtn.onclick = () => { agregarAlCarrito(productoId); renderCardContador(card, productoId); };
    contadorDiv.appendChild(menosBtn);
    contadorDiv.appendChild(span);
    contadorDiv.appendChild(masBtn);
  }
}

// =============================
// 🔹 CARRITO
// =============================
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;
  const item = carrito.find(i => i.id === id);
  if (item) { item.cantidad++; } else { carrito.push({ ...producto, cantidad: 1 }); }
  renderCarrito();
}

function quitarDelCarrito(id) {
  const index = carrito.findIndex(i => i.id === id);
  if (index > -1) {
    carrito[index].cantidad--;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  }
  renderCarrito();
}

function renderCarrito() {
  carritoItems.innerHTML = "";
  let total = 0;
  
  carrito.forEach(i => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${i.nombre} x${i.cantidad}</span>
      <span>${(i.precio * i.cantidad).toFixed(2)} €</span>
    `;
    carritoItems.appendChild(li);
    total += i.precio * i.cantidad;
  });
  
  totalCarrito.textContent = `${total.toFixed(2)} €`;
  if (totalCarritoFloat) {
    totalCarritoFloat.textContent = `${total.toFixed(2)} €`;
  }
  
  if (carritoFlotante) {
    if (carrito.length > 0) {
      carritoFlotante.style.display = "flex";
    } else {
      carritoFlotante.style.display = "none";
    }
  }
  
  if (cantidadCarritoBtn) {
    cantidadCarritoBtn.textContent = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  }
}

// =============================
// 🔹 BOTÓN FLOTANTE CARRITO
// =============================
if (carritoFlotante) {
  carritoFlotante.addEventListener("click", () => {
    carritoSheet.classList.add("show");
  });
}

if (carritoSheet) {
  carritoSheet.querySelector(".sheet-overlay").addEventListener("click", () => {
    carritoSheet.classList.remove("show");
  });
}

// =============================
// 🔹 MODAL UPSELL
// =============================
function mostrarUpsell() {
  const categoriasSugeridas = ["Entrantes", "Bebidas", "Postres"];
  const productosSugeridos = productos.filter(p =>
    categoriasSugeridas.includes(p.categoria) &&
    !carrito.find(i => i.id === p.id)
  );

  if (productosSugeridos.length === 0) {
    pedidoModal.classList.add("show");
    return;
  }

  const container = document.getElementById("upsellProductos");
  container.innerHTML = "";

  productosSugeridos.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("upsell-card");
    div.innerHTML = `
      <img src="${p.img || 'https://via.placeholder.com/60'}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/60'">
      <div class="upsell-info">
        <span class="upsell-nombre">${p.nombre}</span>
        <span class="upsell-precio">${parseFloat(p.precio).toFixed(2)} €</span>
      </div>
      <div class="upsell-acciones">
        <button class="upsell-agregar-btn">Añadir</button>
        <div class="upsell-contador" style="display:none;">
          <button class="upsell-menos">-</button>
          <span>0</span>
          <button class="upsell-mas">+</button>
        </div>
      </div>
    `;
    container.appendChild(div);

    div.querySelector(".upsell-agregar-btn").addEventListener("click", () => {
      agregarAlCarrito(p.id);
      actualizarUpsellContador(div, p.id);
    });
    div.querySelector(".upsell-menos").addEventListener("click", () => {
      quitarDelCarrito(p.id);
      actualizarUpsellContador(div, p.id);
    });
    div.querySelector(".upsell-mas").addEventListener("click", () => {
      agregarAlCarrito(p.id);
      actualizarUpsellContador(div, p.id);
    });
  });

  upsellModal.classList.add("show");
  carritoSheet.classList.remove("show");
}

function actualizarUpsellContador(div, productoId) {
  const cantidad = carrito.find(i => i.id === productoId)?.cantidad || 0;
  const agregarBtn = div.querySelector(".upsell-agregar-btn");
  const contadorDiv = div.querySelector(".upsell-contador");
  const span = contadorDiv.querySelector("span");
  const menosBtn = contadorDiv.querySelector(".upsell-menos");
  if (cantidad === 0) {
    agregarBtn.style.display = "block";
    contadorDiv.style.display = "none";
  } else {
    agregarBtn.style.display = "none";
    contadorDiv.style.display = "flex";
    span.textContent = cantidad;
    menosBtn.textContent = cantidad === 1 ? "🗑" : "-";
  }
}

btnSaltarUpsell.addEventListener("click", () => {
  upsellModal.classList.remove("show");
  pedidoModal.classList.add("show");
});

btnContinuarUpsell.addEventListener("click", () => {
  upsellModal.classList.remove("show");
  pedidoModal.classList.add("show");
});

// =============================
// 🔹 MODAL FORMULARIO CLIENTE
// =============================
finalizarPedido.addEventListener("click", () => {
  if (carrito.length === 0) return;
  carritoSheet.classList.remove("show");
  mostrarUpsell();
});

cancelarPedido.addEventListener("click", () => {
  pedidoModal.classList.remove("show");
});

confirmarPedido.addEventListener("click", async () => {
  const direccion = direccionEntregaInput.value.trim();
  const telefono = telefonoContactoInput.value.trim();
  if (!direccion || !telefono) {
    alert("Dirección y teléfono son obligatorios");
    return;
  }
  
  // Obtener usuario logueado
  usuarioJSON = localStorage.getItem('usuario');
  if (!usuarioJSON) {
    alert('Debes iniciar sesión para hacer un pedido');
    window.location.href = '/login.html';
    return;
  }
  usuario = JSON.parse(usuarioJSON);

  // Calcular total en céntimos
  const total = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  const totalCentimos = Math.round(total * 100);

  // Mostrar modal de pago
  pedidoModal.classList.remove("show");
  mostrarModalPago(totalCentimos, direccion, telefono);
});

// =============================
// 🔹 MODAL DE PAGO STRIPE
// =============================
let stripe = null;
let elements = null;
let clientSecret = null;

async function mostrarModalPago(totalCentimos, direccion, telefono) {
  try {
    // Obtener clave publicable de Stripe
    const configRes = await fetch(`${API_URL}/stripe-config`);
    const { publishableKey } = await configRes.json();
    
    // Inicializar Stripe
    stripe = Stripe(publishableKey);
    
    // Crear Payment Intent
    const paymentRes = await fetch(`${API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalCentimos })
    });
    
    const { clientSecret: secret } = await paymentRes.json();
    clientSecret = secret;
    
// Crear elementos de pago
const appearance = {
  theme: 'stripe',
};
elements = stripe.elements({ clientSecret, appearance });
const paymentElement = elements.create('payment');

// Montar el elemento con manejo de errores
try {
  await paymentElement.mount('#payment-element');
  console.log('✅ Elemento de pago montado correctamente');
} catch (error) {
  console.error('❌ Error montando elemento de pago:', error);
  throw error;
}

    
    // Mostrar modal y total
    document.getElementById('pagoModal').classList.add('show');
    document.getElementById('modalTotal').textContent = `${(totalCentimos / 100).toFixed(2)} €`;
    
    // Guardar datos del pedido para después del pago
    window.pedidoTemp = { direccion, telefono };

    // Botón cancelar pago
document.getElementById('cancelarPago').addEventListener('click', () => {
  document.getElementById('pagoModal').classList.remove('show');
  pedidoModal.classList.add('show');
});

// Botón confirmar pago
document.getElementById('confirmarPagoStripe').addEventListener('click', async () => {
  const messageDiv = document.getElementById('payment-message');
  messageDiv.className = 'payment-message';
  messageDiv.textContent = '';
  
  console.log('💳 Procesando pago...');
  
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/carta.html`,
    },
    redirect: 'if_required'
  });
  
  console.log('💳 Respuesta de Stripe:', { error, paymentIntent });
  
  if (error) {
    messageDiv.className = 'payment-message error';
    messageDiv.textContent = error.message;
    console.error('❌ Error en pago:', error);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    console.log('✅ Pago exitoso, creando pedido...');
    await crearPedidoDespuesDePago();
  } else {
    console.log('⚠️ Estado del pago:', paymentIntent?.status);
  }
});
    
  } catch (error) {
    console.error('Error iniciando pago:', error);
    alert('Error al iniciar el pago. Intenta de nuevo.');
    pedidoModal.classList.add('show');
  }
}


async function crearPedidoDespuesDePago() {
  console.log('🔵 Iniciando creación de pedido después de pago');
  console.log('🔵 Usuario:', usuario);
  console.log('🔵 Carrito:', carrito);
  console.log('🔵 Datos temp:', window.pedidoTemp);
  
  try {
    const pedidoData = {
      usuario_id: usuario.id,
      productos: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      })),
      alergenos: alergenosInput.value,
      comentario: comentarioPedidoInput.value,
      direccion: window.pedidoTemp.direccion,
      telefono: window.pedidoTemp.telefono
    };
    
    console.log('🟢 Pedido a enviar:', pedidoData);
    
    const response = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoData)
    });
    
    console.log('🟡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.error || "Error al crear el pedido");
    }
    
    console.log('✅ Pedido creado exitosamente');
    
    document.getElementById('pagoModal').classList.remove('show');
    alert("¡Pago realizado y pedido confirmado! ✅");
    
    carrito = [];
    renderCarrito();
    alergenosInput.value = "";
    comentarioPedidoInput.value = "";
    direccionEntregaInput.value = "";
    telefonoContactoInput.value = "";
    renderProductos();
  } catch (error) {
    console.error("❌ Error completo:", error);
    alert("Pago realizado pero hubo un error al crear el pedido. Contacta con soporte.");
  }
}




// =============================
// 🔹 BOTÓN ADMIN
// =============================
const btnAdmin = document.getElementById("btnAdmin");
if (btnAdmin) {
  btnAdmin.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

// =============================
// 🔹 INICIALIZAR
// =============================
cargarProductosDesdeAPI();
renderCarrito();
