// =============================
// 🔹 PROMPT DE INSTALACIÓN PWA
// =============================

let deferredPrompt;
let installButton;

// Crear botón de instalación
function createInstallButton() {
  installButton = document.createElement('button');
  installButton.className = 'install-app-btn';
  installButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    <span>Instalar App</span>
  `;
  installButton.style.display = 'none';
  document.body.appendChild(installButton);
  
  // Estilos
  const style = document.createElement('style');
  style.textContent = `
    .install-app-btn {
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: white;
      color: var(--primary, #ff6b35);
      border: 2px solid var(--primary, #ff6b35);
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 999;
      transition: all 0.2s ease;
      animation: slideInRight 0.5s ease;
    }
    
    .install-app-btn:active {
      transform: scale(0.95);
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(200px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .install-app-btn {
        bottom: 100px;
        right: 10px;
        left: 10px;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(styleInstall);
}

// Capturar evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar botón de instalación
  if (!installButton) createInstallButton();
  installButton.style.display = 'flex';
  
  // Añadir evento de click
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    if (window.haptic) window.haptic.medium();
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('App instalada');
      if (window.haptic) window.haptic.heavy();
    }
    
    deferredPrompt = null;
    installButton.style.display = 'none';
  });
});

// Ocultar botón si ya está instalada
window.addEventListener('appinstalled', () => {
  if (installButton) {
    installButton.style.display = 'none';
  }
  console.log('App instalada correctamente');
});

// Para iOS (no soporta beforeinstallprompt)
if (window.navigator.standalone === false) {
  // Usuario en Safari iOS sin instalar
  setTimeout(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !installButton) {
      createInstallButton();
      installButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12" y2="18"/>
        </svg>
        <span>Añadir a inicio</span>
      `;
      installButton.style.display = 'flex';
      
      installButton.addEventListener('click', () => {
        alert('Para instalar:\n1. Toca el botón de compartir\n2. Selecciona "Añadir a pantalla de inicio"');
      });
    }
  }, 3000);
}
