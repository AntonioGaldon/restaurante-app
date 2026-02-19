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
if (tabName === 'categorias') cargarCategorias();

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
// GESTIÓN DE CATEGORÍAS
// ============================= 

const categoriaForm = document.getElementById("categoriaForm");
const listaCategorias = document.getElementById("listaCategorias");
const categoriaId = document.getElementById("categoriaId");
const categoriaNombre = document.getElementById("categoriaNombre");
const categoriaIcono = document.getElementById("categoriaIcono");
const categoriaOrden = document.getElementById("categoriaOrden");
const categoriaActiva = document.getElementById("categoriaActiva");
const btnCancelarCategoria = document.getElementById("cancelarCategoria");

let editandoCategoria = false;

async function cargarCategorias() {
  try {
    const res = await fetch(`${API_URL}/categorias?all=true`);
    const categorias = await res.json();
    listaCategorias.innerHTML = "";
    
    if (categorias.length === 0) {
      listaCategorias.innerHTML = "<p style='text-align:center; color:#999;'>No hay categorías</p>";
      return;
    }
    
    categorias.forEach(cat => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="item-info">
          <strong>${cat.icono || '📦'} ${cat.nombre}</strong>
          <span>Orden: ${cat.orden} - ${cat.activa ? '✅ Activa' : '❌ Inactiva'}</span>
        </div>
        <div class="item-actions">
          <button class="edit" onclick="editarCategoria(${cat.id})">Editar</button>
          <button class="toggle ${cat.activa ? '' : 'inactive'}" onclick="toggleCategoria(${cat.id})">
            ${cat.activa ? 'Desactivar' : 'Activar'}
          </button>
          <button class="delete" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
        </div>
      `;
      listaCategorias.appendChild(li);
    });
  } catch (err) { 
    console.error(err); 
    listaCategorias.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar categorías</p>";
  }
}

categoriaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
 const categoriaData = {
  nombre: categoriaNombre.value,
  icono: categoriaIcono.value || "📦",
  imagen: document.getElementById("categoriaImagen").value || "",
  orden: parseInt(categoriaOrden.value) || 0,
  activa: categoriaActiva.checked
};

  
  try {
    let res;
    if (editandoCategoria) {
      res = await fetch(`${API_URL}/categorias/${categoriaId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaData)
      });
    } else {
      res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaData)
      });
    }
    
    if (!res.ok) throw new Error("Error guardando categoría");
    
    categoriaForm.reset();
    categoriaActiva.checked = true;
    editandoCategoria = false;
    cargarCategorias();
    alert("Categoría guardada correctamente");
  } catch (err) {
    console.error("Error guardando categoría:", err);
    alert("Error al guardar categoría");
  }
});

window.editarCategoria = async function(id) {
  try {
    const res = await fetch(`${API_URL}/categorias?all=true`);
    const categorias = await res.json();
    const cat = categorias.find(c => c.id === id);
    
    if (!cat) throw new Error("Categoría no encontrada");
    
    categoriaId.value = cat.id;
    categoriaNombre.value = cat.nombre;
    categoriaIcono.value = cat.icono;
    categoriaOrden.value = cat.orden;
    categoriaActiva.checked = cat.activa;
    editandoCategoria = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) { 
    console.error(err); 
    alert("Error al cargar categoría");
  }
};

btnCancelarCategoria.addEventListener("click", () => {
  categoriaForm.reset();
  categoriaActiva.checked = true;
  editandoCategoria = false;
});

window.toggleCategoria = async function(id) {
  try {
    await fetch(`${API_URL}/categorias/${id}/toggle`, { method: "PUT" });
    cargarCategorias();
  } catch (err) { 
    console.error(err);
    alert("Error al cambiar estado");
  }
};

window.eliminarCategoria = async function(id) {
  if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;
  try {
    await fetch(`${API_URL}/categorias/${id}`, { method: "DELETE" });
    cargarCategorias();
    alert("Categoría eliminada");
  } catch (err) { 
    console.error(err);
    alert("Error al eliminar categoría");
  }
};


// ============================= 
// INICIALIZAR
// ============================= 

cargarProductos();

// Auto-actualización según pestaña activa
setInterval(() => {
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  if (activeTab === 'productos') cargarProductos();
  if (activeTab === 'promociones') cargarPromociones();
}, 8000);

