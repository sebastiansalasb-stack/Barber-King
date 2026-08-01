/* =========================================================
   Barber King - auth.js
   Persona 1: registro, inicio de sesión y manejo de sesión.
   Se simula un backend usando localStorage del navegador
   (no hay servidor real, es un prototipo académico).
   ========================================================= */

const CLAVE_USUARIOS = "barberking_usuarios";
const CLAVE_SESION = "barberking_sesion";

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");
  const formRegistro = document.getElementById("form-registro");
  const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

  if (formLogin) {
    formLogin.addEventListener("submit", manejarInicioSesion);
  }

  if (formRegistro) {
    formRegistro.addEventListener("submit", manejarRegistro);
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", cerrarSesion);
  }
});

/**
 * Obtiene la lista de usuarios registrados desde localStorage.
 */
function obtenerUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);
  return datos ? JSON.parse(datos) : [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

/**
 * Genera una sal aleatoria (en hexadecimal) para cada usuario nuevo.
 */
function generarSal() {
  const bytesAleatorios = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytesAleatorios)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Calcula el hash SHA-256 de (sal + contraseña) usando Web Crypto API.
 * Así la contraseña nunca se guarda en texto plano en localStorage,
 * aunque este proyecto no tenga un servidor real detrás.
 */
async function hashearContrasena(contrasena, sal) {
  const datos = new TextEncoder().encode(sal + contrasena);
  const bufferHash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(bufferHash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Maneja el envío del formulario de registro:
 * valida los campos, guarda el nuevo usuario y redirige al login.
 */
async function manejarRegistro(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const aceptaTerminos = document.getElementById("terminos").checked;
  const mensajeError = document.getElementById("mensaje-error-registro");

  if (!nombre || !usuario || !contrasena) {
    mostrarMensaje(mensajeError, "Por favor completa todos los campos.");
    return;
  }

  if (contrasena.length < 6) {
    mostrarMensaje(mensajeError, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (!aceptaTerminos) {
    mostrarMensaje(mensajeError, "Debes aceptar los Términos y Condiciones para continuar.");
    return;
  }

  const usuarios = obtenerUsuarios();
  const yaExiste = usuarios.some(
    (u) => u.usuario.toLowerCase() === usuario.toLowerCase()
  );

  if (yaExiste) {
    mostrarMensaje(mensajeError, "Ese nombre de usuario ya está registrado.");
    return;
  }

  const sal = generarSal();
  const hash = await hashearContrasena(contrasena, sal);

  usuarios.push({ nombre, usuario, sal, hash });
  guardarUsuarios(usuarios);

  window.location.href = "index.html";
}

/**
 * Maneja el envío del formulario de login:
 * valida credenciales contra los usuarios guardados.
 */
async function manejarInicioSesion(evento) {
  evento.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const mensajeError = document.getElementById("mensaje-error-login");

  const usuarioEncontrado = obtenerUsuarios().find(
    (u) => u.usuario.toLowerCase() === usuario.toLowerCase()
  );

  if (!usuarioEncontrado) {
    mostrarMensaje(mensajeError, "Usuario o contraseña incorrectos.");
    return;
  }

  const hashIngresado = await hashearContrasena(contrasena, usuarioEncontrado.sal);

  if (hashIngresado !== usuarioEncontrado.hash) {
    mostrarMensaje(mensajeError, "Usuario o contraseña incorrectos.");
    return;
  }

  localStorage.setItem(CLAVE_SESION, usuarioEncontrado.usuario);
  window.location.href = "menu.html";
}

/**
 * Cierra la sesión actual y redirige al login.
 */
function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  window.location.href = "index.html";
}

/**
 * Devuelve el usuario con sesión activa, o null si no hay ninguno.
 * Útil para que menu.js / citas.js sepan de quién son las citas.
 */
function obtenerUsuarioActual() {
  return localStorage.getItem(CLAVE_SESION);
}

/**
 * Muestra un mensaje de error dentro del elemento indicado.
 */
function mostrarMensaje(elemento, texto) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.hidden = false;
}
