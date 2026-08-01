/* =========================================================
   Barber King - citas.js
   Persona 3: agendar, listar y cancelar citas.
   Las citas se guardan en localStorage, asociadas al usuario
   con sesión activa (ver obtenerUsuarioActual() en auth.js).
   ========================================================= */

const CLAVE_CITAS = "barberking_citas";

document.addEventListener("DOMContentLoaded", () => {
  const formAgendar = document.getElementById("form-agendar-cita");
  const listaCitas = document.getElementById("lista-citas");

  if (formAgendar) {
    formAgendar.addEventListener("submit", manejarAgendarCita);
  }

  if (listaCitas) {
    renderizarCitas();
  }
});

const NOMBRES_SERVICIO = {
  corte: "Corte de cabello",
  barba: "Arreglo de barba",
  combo: "Combo (corte + barba)",
};

const NOMBRES_BARBERO = {
  barbero1: "Alberto Martinez",
  barbero2: "Raul Gonzales",
};

/**
 * Obtiene todas las citas guardadas (de todos los usuarios) desde localStorage.
 */
function obtenerCitas() {
  const datos = localStorage.getItem(CLAVE_CITAS);
  return datos ? JSON.parse(datos) : [];
}

function guardarCitas(citas) {
  localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));
}

/**
 * Maneja el envío del formulario "Agendar Cita".
 */
function manejarAgendarCita(evento) {
  evento.preventDefault();

  const servicio = document.getElementById("servicio").value;
  const barbero = document.getElementById("barbero").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const mensaje = document.getElementById("mensaje-confirmacion-cita");

  if (!servicio || !barbero || !fecha || !hora) {
    mensaje.textContent = "Completa todos los campos antes de confirmar.";
    mensaje.classList.remove("mensaje-exito");
    mensaje.classList.add("mensaje-error");
    mensaje.hidden = false;
    return;
  }

  const nuevaCita = {
    id: Date.now(),
    usuario: obtenerUsuarioActual(),
    servicio,
    barbero,
    fecha,
    hora,
    estado: "pendiente",
  };

  const citas = obtenerCitas();
  citas.push(nuevaCita);
  guardarCitas(citas);

  mensaje.textContent = "¡Cita agendada con éxito! Puedes revisarla en \"Mis Citas\".";
  mensaje.classList.remove("mensaje-error");
  mensaje.classList.add("mensaje-exito");
  mensaje.hidden = false;
  evento.target.reset();
}

/**
 * Dibuja en pantalla las citas del usuario con sesión activa,
 * dentro de #lista-citas (mis-citas.html).
 */
function renderizarCitas() {
  const contenedor = document.getElementById("lista-citas");
  const mensajeSinCitas = document.getElementById("mensaje-sin-citas");
  const usuarioActual = obtenerUsuarioActual();

  contenedor
    .querySelectorAll(".tarjeta-cita")
    .forEach((tarjeta) => tarjeta.remove());

  const citasDelUsuario = obtenerCitas().filter(
    (cita) => cita.usuario === usuarioActual
  );

  if (citasDelUsuario.length === 0) {
    mensajeSinCitas.hidden = false;
    return;
  }

  mensajeSinCitas.hidden = true;

  citasDelUsuario.forEach((cita) => {
    // Se arma la tarjeta con createElement/textContent (en vez de innerHTML)
    // para que el contenido de la cita nunca se interprete como HTML/JS.
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-cita";

    const detalle = document.createElement("div");

    const nombreServicio = document.createElement("strong");
    nombreServicio.textContent = NOMBRES_SERVICIO[cita.servicio] || cita.servicio;

    const infoCita = document.createElement("p");
    infoCita.textContent = `${NOMBRES_BARBERO[cita.barbero] || cita.barbero} · ${cita.fecha} · ${cita.hora}`;

    detalle.appendChild(nombreServicio);
    detalle.appendChild(infoCita);

    const botonCancelar = document.createElement("button");
    botonCancelar.type = "button";
    botonCancelar.textContent = "Cancelar Cita";
    botonCancelar.addEventListener("click", () => cancelarCita(cita.id));

    tarjeta.appendChild(detalle);
    tarjeta.appendChild(botonCancelar);
    contenedor.appendChild(tarjeta);
  });
}

/**
 * Cancela (elimina) una cita por su id y vuelve a dibujar la lista.
 */
function cancelarCita(idCita) {
  const confirmarCancelacion = window.confirm(
    "¿Seguro que deseas cancelar esta cita?"
  );
  if (!confirmarCancelacion) return;

  const usuarioActual = obtenerUsuarioActual();

  // Solo se elimina la cita si además de coincidir el id, pertenece
  // al usuario con sesión activa (evita cancelar citas de otra persona).
  const citas = obtenerCitas().filter(
    (cita) => !(cita.id === idCita && cita.usuario === usuarioActual)
  );
  guardarCitas(citas);
  renderizarCitas();
}
