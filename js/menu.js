/* =========================================================
   Barber King - menu.js
   Persona 2: navegación del menú principal.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();
  resaltarEnlaceActivo();
});

/**
 * Redirige al login si no hay una sesión activa.
 * Evita que alguien entre directo a menu.html / agendar-cita.html / mis-citas.html
 * escribiendo la URL sin haber iniciado sesión.
 */
function protegerPagina() {
  const paginasProtegidas = ["menu.html", "agendar-cita.html", "mis-citas.html"];
  const paginaActual = window.location.pathname.split("/").pop();

  if (paginasProtegidas.includes(paginaActual) && !obtenerUsuarioActual()) {
    window.location.href = "index.html";
  }
}

/**
 * Resalta en la barra de navegación el enlace de la página actual.
 */
function resaltarEnlaceActivo() {
  const paginaActual = window.location.pathname.split("/").pop();

  document.querySelectorAll(".nav-principal a").forEach((enlace) => {
    const destino = enlace.getAttribute("href").split("#")[0];
    if (destino === paginaActual) {
      enlace.classList.add("activo");
    }
  });
}
