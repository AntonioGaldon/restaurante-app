const API_URL = window.location.origin;

// ============================= 
// TABS
// ============================= 

const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registroForm = document.getElementById('registroForm');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (tab === 'login') {
      loginForm.classList.add('active');
      registroForm.classList.remove('active');
    } else {
      registroForm.classList.add('active');
      loginForm.classList.remove('active');
    }
  });
});

// ============================= 
// LOGIN
// ============================= 

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error || 'Error al iniciar sesión');
      return;
    }
    
    // Guardar sesión en localStorage
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    
    alert('¡Bienvenido ' + data.usuario.nombre + '!');
    
    // Redirigir según el rol
    if (data.usuario.rol === 'admin') {
      window.location.href = '/admin.html';
    } else if (data.usuario.rol === 'restaurante') {
      window.location.href = '/restaurante.html';
    } else {
      window.location.href = '/home.html';
    }
  } catch (err) {
    console.error(err);
    alert('Error al iniciar sesión');
  }
});

// ============================= 
// REGISTRO
// ============================= 

registroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById('registroNombre').value;
  const email = document.getElementById('registroEmail').value;
  const telefono = document.getElementById('registroTelefono').value;
  const direccion = document.getElementById('registroDireccion').value;
  const password = document.getElementById('registroPassword').value;
  const passwordConfirm = document.getElementById('registroPasswordConfirm').value;
  
  // Validar contraseñas
  if (password !== passwordConfirm) {
    alert('Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, direccion, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error || 'Error al registrarse');
      return;
    }
    
    alert('¡Cuenta creada correctamente! Ahora puedes iniciar sesión.');
    
    // Cambiar a pestaña de login
    tabBtns[0].click();
    registroForm.reset();
  } catch (err) {
    console.error(err);
    alert('Error al registrarse');
  }
});

// ============================= 
// CONTINUAR COMO INVITADO
// ============================= 

document.getElementById('btnContinuarInvitado').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = '/home.html';
});

// ============================= 
// VERIFICAR SI YA HAY SESIÓN
// ============================= 

window.addEventListener('DOMContentLoaded', () => {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    const user = JSON.parse(usuario);
    if (confirm(`Ya tienes una sesión iniciada como ${user.nombre}. ¿Quieres continuar?`)) {
      window.location.href = '/home.html';
    } else {
      localStorage.removeItem('usuario');
    }
  }
});
