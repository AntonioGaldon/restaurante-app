// =============================
// 🔹 HAPTIC FEEDBACK
// =============================

// Vibración ligera (10ms) - para toques normales
function hapticLight() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

// Vibración media (20ms) - para acciones importantes
function hapticMedium() {
  if ('vibrate' in navigator) {
    navigator.vibrate(20);
  }
}

// Vibración fuerte (50ms) - para confirmaciones/errores
function hapticHeavy() {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

// Aplicar haptic a todos los botones automáticamente
document.addEventListener('DOMContentLoaded', () => {
  // Botones normales
  document.querySelectorAll('button:not(.no-haptic)').forEach(btn => {
    btn.addEventListener('click', hapticLight);
  });
  
  // Links que parecen botones
  document.querySelectorAll('a.btn, a.category-card, a.promo-card').forEach(link => {
    link.addEventListener('click', hapticLight);
  });
  
  // Botones de agregar al carrito
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('agregarBtn') || 
        e.target.classList.contains('cart-float')) {
      hapticMedium();
    }
  });
});

// Exportar funciones para uso manual
window.haptic = {
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy
};
