// =============================
// 🔹 PULL TO REFRESH
// =============================

let startY = 0;
let currentY = 0;
let isPulling = false;
const pullThreshold = 80; // Píxeles para activar refresh

// Crear indicador visual
const refreshIndicator = document.createElement('div');
refreshIndicator.className = 'refresh-indicator';
refreshIndicator.innerHTML = '↓';
document.body.insertBefore(refreshIndicator, document.body.firstChild);

// Estilos del indicador
const style = document.createElement('style');
style.textContent = `
  .refresh-indicator {
    position: fixed;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    background: var(--primary, #ff6b35);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all 0.3s ease;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .refresh-indicator.pulling {
    top: 10px;
  }
  
  .refresh-indicator.refreshing {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: translateX(-50%) rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Detectar inicio del pull
document.addEventListener('touchstart', (e) => {
  if (window.scrollY === 0) {
    startY = e.touches[0].pageY;
    isPulling = true;
  }
});

// Detectar movimiento
document.addEventListener('touchmove', (e) => {
  if (!isPulling) return;
  
  currentY = e.touches[0].pageY;
  const pullDistance = currentY - startY;
  
  if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
    e.preventDefault();
    refreshIndicator.style.top = `${Math.min(pullDistance - 50, 10)}px`;
    refreshIndicator.style.transform = `translateX(-50%) rotate(${pullDistance * 2}deg)`;
  }
});

// Detectar fin del pull
document.addEventListener('touchend', () => {
  if (!isPulling) return;
  
  const pullDistance = currentY - startY;
  
  if (pullDistance > pullThreshold) {
    // Activar refresh
    refreshIndicator.classList.add('refreshing');
    refreshIndicator.innerHTML = '⟳';
    
    if (window.haptic) window.haptic.medium();
    
    // Recargar página después de animación
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    // Volver a posición original
    refreshIndicator.style.top = '-60px';
    refreshIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
  }
  
  isPulling = false;
  startY = 0;
  currentY = 0;
});
