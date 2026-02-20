const categoriesGrid = document.getElementById('categoriesGrid');
const searchInput = document.getElementById('searchInput');

let categories = [];

// Cargar categorías desde la API
async function cargarCategorias() {
  try {
    const response = await fetch(`${window.location.origin}/categorias`);
    categories = await response.json();
    
    if (categories.length === 0) {
      categoriesGrid.innerHTML = '<p style="text-align:center; color:#999;">No hay categorías disponibles</p>';
      return;
    }
    
    renderCategories();
  } catch (error) {
    console.error('Error cargando categorías:', error);
    categoriesGrid.innerHTML = '<p style="text-align:center; color:#999;">Error al cargar categorías</p>';
  }
}

function renderCategories(filteredCategories = categories) {
  categoriesGrid.innerHTML = '';
  
  filteredCategories.forEach(cat => {
    const card = document.createElement('a');
    card.href = `carta.html?categoria=${encodeURIComponent(cat.nombre)}`;
    card.className = 'category-card';
    
    // Priorizar imagen sobre icono
    const iconoHTML = cat.imagen 
      ? `<img src="${cat.imagen}" alt="${cat.nombre}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` 
      : cat.icono || '📦';
    
    card.innerHTML = `
      <div class="category-icon">${iconoHTML}</div>
      <div class="category-name">${cat.nombre}</div>
    `;
    categoriesGrid.appendChild(card);
  });
}

searchInput.addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = categories.filter(cat => 
    cat.nombre.toLowerCase().includes(search)
  );
  renderCategories(filtered);
});

// Inicializar
cargarCategorias();

// =============================
// PROMOCIONES
// =============================
const promosGrid = document.getElementById('promosGrid');

async function cargarPromociones() {
  try {
    const response = await fetch(`${window.location.origin}/promociones`);
    const promos = await response.json();
    
    if (promos.length === 0) {
      promosGrid.innerHTML = '<p style="text-align:center; color:#999;">No hay promociones activas</p>';
      return;
    }
    
    promosGrid.innerHTML = '';
    promos.forEach(promo => {
      const card = document.createElement('div');
      card.className = 'promo-card';
      card.onclick = () => {
        // Guardar promo en localStorage para añadirla al carrito
        localStorage.setItem('promoSeleccionada', JSON.stringify(promo));
        window.location.href = 'carta.html';
      };
      
      card.innerHTML = `
        <img src="${promo.imagen || 'https://via.placeholder.com/280x150?text=Promo'}" alt="${promo.titulo}">
        <div class="promo-titulo">${promo.titulo}</div>
        <div class="promo-descripcion">${promo.descripcion || ''}</div>
        <div class="promo-precio">${parseFloat(promo.precio).toFixed(2)} €</div>
      `;
      
      promosGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Error cargando promociones:', error);
    promosGrid.innerHTML = '<p style="text-align:center; color:#999;">Error al cargar promociones</p>';
  }
}

// =============================
// 🔹 GESTIÓN DE USUARIO
// =============================

const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const btnLogout = document.getElementById('btnLogout');
const btnProfile = document.getElementById('btnProfile');

// Mostrar info del usuario si está logueado
const usuarioJSON = localStorage.getItem('usuario');
if (usuarioJSON) {
  const usuario = JSON.parse(usuarioJSON);
  userName.textContent = usuario.nombre;
  userInfo.style.display = 'block';
}

// Botón de perfil
if (btnProfile) {
  btnProfile.addEventListener('click', () => {
    if (usuarioJSON) {
      window.location.href = '/pedidos.html';
    } else {
      window.location.href = '/login.html';
    }
  });
}


// Cerrar sesión
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      localStorage.removeItem('usuario');
      window.location.href = '/login.html';
    }
  });
}

cargarPromociones();

// Auto-actualización cada 10 segundos
setInterval(() => {
  cargarPromociones();
}, 10000);
