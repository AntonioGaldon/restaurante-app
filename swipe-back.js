// =============================
// 🔹 SWIPE PARA VOLVER ATRÁS
// =============================

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isSwiping = false;

// Indicador visual de swipe
const swipeIndicator = document.createElement('div');
swipeIndicator.className = 'swipe-indicator';
swipeIndicator.innerHTML = '←';
document.body.appendChild(swipeIndicator);

// Estilos
const styleSwipe = document.createElement('style');
styleSwipe.textContent = `
  .swipe-indicator {
    position: fixed;
    left: -60px;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255,107,53,0.9);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    z-index: 9999;
    transition: all 0.2s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .swipe-indicator.active {
    left: 20px;
  }
`;
document.head.appendChild(styleSwipe);

// Detectar inicio del swipe
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  
  // Solo activar si empieza desde el borde izquierdo
  if (touchStartX < 30) {
    isSwiping = true;
  }
});

// Detectar movimiento
document.addEventListener('touchmove', (e) => {
  if (!isSwiping) return;
  
  touchEndX = e.touches[0].clientX;
  touchEndY = e.touches[0].clientY;
  
  const swipeDistance = touchEndX - touchStartX;
  const verticalDistance = Math.abs(touchEndY - touchStartY);
  
  // Mostrar indicador si está deslizando horizontalmente
  if (swipeDistance > 20 && verticalDistance < 50) {
    swipeIndicator.classList.add('active');
    swipeIndicator.style.left = `${Math.min(swipeDistance - 60, 20)}px`;
  }
});

// Detectar fin del swipe
document.addEventListener('touchend', () => {
  if (!isSwiping) return;
  
  const swipeDistance = touchEndX - touchStartX;
  const verticalDistance = Math.abs(touchEndY - touchStartY);
  
  // Si deslizó más de 100px horizontalmente y menos de 50px verticalmente
  if (swipeDistance > 100 && verticalDistance < 50) {
    if (window.haptic) window.haptic.medium();
    
    // Volver a la página anterior
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }
  
  // Resetear indicador
  swipeIndicator.classList.remove('active');
  swipeIndicator.style.left = '-60px';
  
  isSwiping = false;
  touchStartX = 0;
  touchStartY = 0;
  touchEndX = 0;
  touchEndY = 0;
});
