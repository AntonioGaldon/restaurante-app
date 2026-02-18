const categories = [
  { name: 'Comida', icon: '🍕', path: 'carta.html?categoria=Comida' },
  { name: 'Snacks', icon: '🍿', path: 'carta.html?categoria=Snacks' },
  { name: 'Bebidas', icon: '🥤', path: 'carta.html?categoria=Bebidas' },
  { name: 'Bebidas Alcohólicas', icon: '🍺', path: 'carta.html?categoria=Bebidas+Alcohólicas' },
  { name: 'Vapers', icon: '💨', path: 'carta.html?categoria=Vapers' },
  { name: 'Parafarmacia', icon: '💊', path: 'carta.html?categoria=Parafarmacia' },
  { name: 'Sexshop', icon: '🔞', path: 'carta.html?categoria=Sexshop' },
  { name: 'Butano y Propano', icon: '🔥', path: 'carta.html?categoria=Butano+y+Propano' },
  { name: 'Panadería', icon: '🥖', path: 'carta.html?categoria=Panadería' },
  { name: 'Higiene', icon: '🧼', path: 'carta.html?categoria=Higiene' },
  { name: 'Botiquín', icon: '🩹', path: 'carta.html?categoria=Botiquín' },
  { name: 'Hogar y Mascotas', icon: '🏠', path: 'carta.html?categoria=Hogar+y+Mascotas' },
  { name: 'Electrónica y Regalos', icon: '🎁', path: 'carta.html?categoria=Electrónica+y+Regalos' },
  { name: 'Helados', icon: '🍦', path: 'carta.html?categoria=Helados' },
  { name: 'Café e Infusiones', icon: '☕', path: 'carta.html?categoria=Café+e+Infusiones' },
  { name: 'Encargos', icon: '📦', path: 'carta.html?categoria=Encargos' }
];

const categoriesGrid = document.getElementById('categoriesGrid');
const searchInput = document.getElementById('searchInput');

function renderCategories(filteredCategories = categories) {
  categoriesGrid.innerHTML = '';
  
  filteredCategories.forEach(cat => {
    const card = document.createElement('a');
    card.href = cat.path;
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <div class="category-name">${cat.name}</div>
    `;
    categoriesGrid.appendChild(card);
  });
}

searchInput.addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = categories.filter(cat => 
    cat.name.toLowerCase().includes(search)
  );
  renderCategories(filtered);
});

renderCategories();

