const API_URL = window.location.origin;

// ============================= 
// NAVEGACIÓN
// ============================= 

document.getElementById("btnBack").addEventListener("click", () => {
  window.location.href = "/";
});

document.getElementById("btnRestaurante").addEventListener("click", () => {
  window.location.href = "restaurante.html";
});

// ============================= 
// SISTEMA DE PESTAÑAS
// ============================= 

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (tabName === 'productos') cargarProductos();
    if (tabName === 'promociones') cargarPromociones();
  });
});

// ============================= 
// GESTIÓN DE PRODUCTOS
// ============================= 

const productoForm = document.getElementById("productoForm");
const listaProductos = document.getElementById("listaProductos");
const inputId = document.getElementById("productoId");
const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputCategoria = document.getElementById("categoria");
const inputImg = document.getElementById("img");
const btnCancelar = document.getElementById("cancelarEdicion");

let editandoProducto = false;

async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    listaProductos.innerHTML = "";
    
    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='text-align:center; color:#999;'>No hay productos</p>";
      return;
    }
    
    productos.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="item-info">
          <strong>${p.nombre}</strong>
          <span>${p.precio}€ - ${p.categoria}</span>
        </div>
        <div class="item-actions">
          <button class="edit" onclick="editarProducto(${p.id})">Editar</button>
          <button class="delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </div>
      `;
      listaProductos.appendChild(li);
    });
  } catch (err) { 
    console.error(err); 
    listaProductos.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar productos</p>";
  }
}

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const productoData = {
    nombre: inputNombre.value,
    descripcion: inputDescripcion.value,
    precio: parseFloat(inputPrecio.value),
    categoria: inputCategoria.value,
    img: inputImg.value
  };
  
  try {
    let res;
    if (editandoProducto) {
      res = await fetch(`${API_URL}/productos/${inputId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData)
      });
    } else {
      res = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData)
      });
    }
    
    if (!res.ok) throw new Error("Error guardando producto");
    
    productoForm.reset();
    editandoProducto = false;
    cargarProductos();
    alert("Producto guardado correctamente");
  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("Error al guardar producto");
  }
});

window.editarProducto = async function(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const p = await res.json();
    inputId.value = p.id;
    inputNombre.value = p.nombre;
    inputDescripcion.value = p.descripcion;
    inputPrecio.value = p.precio;
    inputCategoria.value = p.categoria;
    inputImg.value = p.img;
    editandoProducto = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) { 
    console.error(err); 
    alert("Error al cargar producto");
  }
};

btnCancelar.addEventListener("click", () => {
  productoForm.reset();
  editandoProducto = false;
});

window.eliminarProducto = async function(id) {
  if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
  try {
    await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
    cargarProductos();
    alert("Producto eliminado");
  } catch (err) { 
    console.error(err);
    alert("Error al eliminar producto");
  }
};

// ============================= 
// GESTIÓN DE PROMOCIONES
// ============================= 

const promoForm = document.getElementById("promoForm");
const listaPromociones = document.getElementById("listaPromociones");
const promoId = document.getElementById("promoId");
const promoTitulo = document.getElementById("promoTitulo");
const promoDescripcion = document.getElementById("promoDescripcion");
const promoPrecio = document.getElementById("promoPrecio");
const promoImagen = document.getElementById("promoImagen");
const promoActiva = document.getElementById("promoActiva");
const btnCancelarPromo = document.getElementById("cancelarPromo");

let editandoPromo = false;

async function cargarPromociones() {
  try {
    const res = await fetch(`${API_URL}/promociones?all=true`);
    const promos = await res.json();
    listaPromociones.innerHTML = "";
    
    if (promos.length === 0) {
      listaPromociones.innerHTML = "<p style='text-align:center; color:#999;'>No hay promociones</p>";
      return;
    }
    
    promos.forEach(promo => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="item-info">
          <strong>${promo.titulo}</strong>
          <span>${promo.precio}€ - ${promo.activa ? '✅ Activa' : '❌ Inactiva'}</span>
        </div>
        <div class="item-actions">
          <button class="edit" onclick="editarPromo(${promo.id})">Editar</button>
          <button class="toggle ${promo.activa ? '' : 'inactive'}" onclick="togglePromo(${promo.id})">
            ${promo.activa ? 'Desactivar' : 'Activar'}
          </button>
          <button class="delete" onclick="eliminarPromo(${promo.id})">Eliminar</button>
        </div>
      `;
      listaPromociones.appendChild(li);
    });
  } catch (err) { 
    console.error(err); 
    listaPromociones.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar promociones</p>";
  }
}

promoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const promoData = {
    titulo: promoTitulo.value,
    descripcion: promoDescripcion.value,
    precio: parseFloat(promoPrecio.value),
    imagen: promoImagen.value,
    activa: promoActiva.checked
  };
  
  try {
    let res;
    if (editandoPromo) {
      res = await fetch(`${API_URL}/promociones/${promoId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoData)
      });
    } else {
      res = await fetch(`${API_URL}/promociones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoData)
      });
    }
    
    if (!res.ok) throw new Error("Error guardando promoción");
    
    promoForm.reset();
    promoActiva.checked = true;
    editandoPromo = false;
    cargarPromociones();
    alert("Promoción guardada correctamente");
  } catch (err) {
    console.error("Error guardando promoción:", err);
    alert("Error al guardar promoción");
  }
});

window.editarPromo = async function(id) {
  try {
    const res = await fetch(`${API_URL}/promociones?all=true`);
    const promos = await res.json();
    const promo = promos.find(p => p.id === id);
    
    if (!promo) throw new Error("Promoción no encontrada");
    
    promoId.value = promo.id;
    promoTitulo.value = promo.titulo;
    promoDescripcion.value = promo.descripcion;
    promoPrecio.value = promo.precio;
    promoImagen.value = promo.imagen;
    promoActiva.checked = promo.activa;
    editandoPromo = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) { 
    console.error(err); 
    alert("Error al cargar promoción");
  }
};

btnCancelarPromo.addEventListener("click", () => {
  promoForm.reset();
  promoActiva.checked = true;
  editandoPromo = false;
});

window.togglePromo = async function(id) {
  try {
    await fetch(`${API_URL}/promociones/${id}/toggle`, { method: "PUT" });
    cargarPromociones();
  } catch (err) { 
    console.error(err);
    alert("Error al cambiar estado");
  }
};

window.eliminarPromo = async function(id) {
  if (!confirm("¿Seguro que quieres eliminar esta promoción?")) return;
  try {
    await fetch(`${API_URL}/promociones/${id}`, { method: "DELETE" });
    cargarPromociones();
    alert("Promoción eliminada");
  } catch (err) { 
    console.error(err);
    alert("Error al eliminar promoción");
  }
};

// ============================= 
// INICIALIZAR
// ============================= 

cargarProductos();
