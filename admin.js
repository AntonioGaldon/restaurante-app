const API_URL = window.location.origin;

const productoForm = document.getElementById("productoForm");
const listaProductos = document.getElementById("listaProductos");

const inputId = document.getElementById("productoId");
const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputCategoria = document.getElementById("categoria");
const inputImg = document.getElementById("img");
const btnCancelar = document.getElementById("cancelarEdicion");

let editando = false;

async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    listaProductos.innerHTML = "";
    productos.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${p.nombre}</strong> - ${p.precio}€ (${p.categoria})
        <button class="edit" onclick="editarProducto(${p.id})">Editar</button>
        <button class="delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
      `;
      listaProductos.appendChild(li);
    });
  } catch (err) { console.error(err); }
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
    if (editando) {
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
    editando = false;
    cargarProductos();
  } catch (err) {
    console.error("Error guardando producto:", err);
    alert(err.message);
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
    editando = true;
  } catch (err) { console.error(err); }
};

btnCancelar.addEventListener("click", () => {
  productoForm.reset();
  editando = false;
});

window.eliminarProducto = async function(id) {
  if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
  try {
    await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
    cargarProductos();
  } catch (err) { console.error(err); }
};

cargarProductos();