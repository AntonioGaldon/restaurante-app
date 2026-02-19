// =============================
// 🔹 TRANSICIONES ENTRE PÁGINAS
// =============================

// Añadir animación de entrada al cargar
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
  }, 10);
});

// Animar salida al cambiar de página
function navigateWithTransition(url) {
  if (window.haptic) window.haptic.light();
  
  document.body.style.transition = 'opacity 0.2s ease';
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    window.location.href = url;
  }, 200);
}

// Aplicar a todos los enlaces internos
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  
  const href = link.getAttribute('href');
  
  // Solo aplicar a enlaces internos (sin http:// o https://)
  if (href && !href.startsWith('http') && !href.startsWith('#')) {
    e.preventDefault();
    navigateWithTransition(href);
  }
});

// Exportar para uso manual
window.navigateWithTransition = navigateWithTransition;

// Animación para modales
const style = document.createElement('style');
style.textContent = `
  .modal {
    animation: fadeIn 0.3s ease;
  }
  
  .modal.show {
    animation: fadeIn 0.3s ease;
  }
  
  .bottom-sheet .sheet-content {
    animation: slideUp 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;
document.head.appendChild(style);
