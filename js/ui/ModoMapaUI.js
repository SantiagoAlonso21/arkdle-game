import { ModoMapa } from "../modos/ModoMapa.js";

let modo;
let esModoMapaDiario = true;
let eventListenersConfigurados = false;

export function iniciarModoMapa() {
    // Solo crear una nueva instancia si no existe
    if (!modo) {
        modo = new ModoMapa(esModoMapaDiario);
        modo.inicializarModo().then(() => {
            mostrarImagenUbicacion();
        });
    }

    document.getElementById("vistaModoMapa").style.display = "flex";
    document.getElementById("headerModos").style.display = "flex";

    // Configurar event listeners solo la primera vez
    if (!eventListenersConfigurados) {
        configurarEventListeners();
        eventListenersConfigurados = true;
    }
}

function configurarEventListeners() {
    // Modal de ajustes
    const modalSettings = document.getElementById("modalSettingsModoMapa");
    const btnSettings = document.getElementById("btnSettingsModoDino");
    const btnCerrarModal = document.getElementById("cerrarModalSettingsModoMapa");

    btnSettings.addEventListener("click", function () {
        modalSettings.style.display = "flex";
    });

    btnCerrarModal.addEventListener("click", function () {
        modalSettings.style.display = "none";
    });

    // Radio buttons para cambiar entre diario y aleatorio
    document.getElementById("radioMapaDiario").addEventListener("change", function () {
        if (this.checked) {
            esModoMapaDiario = true;
            reiniciarModo();
        }
    });

    document.getElementById("radioMapaAleatorio").addEventListener("change", function () {
        if (this.checked) {
            esModoMapaDiario = false;
            reiniciarModo();
        }
    });

    // Navegabilidad dentro del Modo Mapa
    document.getElementById("btnNavMapaADino").addEventListener("click", function () {
        location.hash = '/modoDinosaurio';
    });

    document.getElementById("btnNavMapaAMapa").addEventListener("click", function () {
        location.hash = '/modoMapa';
    });

    document.getElementById("btnNavMapaACriatura").addEventListener("click", function () {
        location.hash = '/modoCriatura';
    });

    document.getElementById("btnNavMapaAMontura").addEventListener("click", function () {
        location.hash = '/modoMontura';
    });

    // Input de búsqueda
    const inputBusquedaMapa = document.getElementById("inputBuscarModoMapa");
    let posListaSugerencias = 0;

    inputBusquedaMapa.addEventListener("input", function () {
        cargarSugerencias(inputBusquedaMapa.value);
        posListaSugerencias = 0;
        destacarSugerenciaUI(posListaSugerencias);
    });

    inputBusquedaMapa.addEventListener("keydown", function (e) {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            posListaSugerencias = Math.max(0, posListaSugerencias - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            posListaSugerencias = Math.min(Math.min(6, modo.listaMapasSugeridos.length - 1), posListaSugerencias + 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (modo.listaMapasSugeridos[posListaSugerencias] && !modo.mapaEncontrado) {
                seleccionarMapaUI(modo.listaMapasSugeridos[posListaSugerencias]);
            }
        }
        destacarSugerenciaUI(posListaSugerencias);
    });

    // Click en el mapa para marcar ubicación (máximo 3 intentos)
    const imagenMapa = document.getElementById("imagenMapaCompleto");
    imagenMapa.addEventListener("click", function (e) {
        if (!modo.mapaEncontrado || modo.ubicacionEncontrada || modo.intentosRealizados >= modo.intentosMaximos) return;

        const rect = imagenMapa.getBoundingClientRect();
        // Calcular coordenadas relativas (0-100)
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const resultado = modo.marcarUbicacion(x, y);
        if (resultado) {
            mostrarMarcador(x, y, resultado.esCorrecta, resultado.sinIntentos);
            mostrarResultadoUbicacion(resultado);
        }
    });
}

// #region Imagen de ubicación
function mostrarImagenUbicacion() {
    const imagenUbicacion = document.getElementById("imagenUbicacionMapa");
    imagenUbicacion.src = modo.obtenerImagenUbicacion();
    imagenUbicacion.hidden = false;
}
// #endregion

// #region Sugerencias
function cargarSugerencias(mapaBuscado) {
    const listaSugerenciasUI = document.getElementById('listaSugerenciasModoMapa');
    listaSugerenciasUI.innerHTML = '';

    modo.obtenerSugerencias(mapaBuscado);
    const limite = Math.min(modo.listaMapasSugeridos.length, 7);
    for (let i = 0; i < limite; i++) {
        listaSugerenciasUI.appendChild(crearSugerenciaMapaUI(modo.listaMapasSugeridos[i]));
    }

    if (modo.listaMapasSugeridos.length === 0) {
        listaSugerenciasUI.hidden = true;
    } else {
        listaSugerenciasUI.hidden = false;
    }
}

function crearSugerenciaMapaUI(nombreMapa) {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = modo.mapaImagenes[nombreMapa] + ".webp";
    img.alt = nombreMapa;

    const span = document.createElement('span');
    span.textContent = nombreMapa;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener('click', () => {
        if (!modo.mapaEncontrado) {
            seleccionarMapaUI(nombreMapa);
        }
    });

    return li;
}

function destacarSugerenciaUI(indice) {
    const listaSugerencias = document.getElementById('listaSugerenciasModoMapa');
    const items = listaSugerencias.querySelectorAll('li');

    items.forEach(item => item.classList.remove('destacado'));

    if (items[indice]) {
        items[indice].classList.add('destacado');
        items[indice].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}
// #endregion

// #region Selección de mapa
function seleccionarMapaUI(nombreMapa) {
    const resultado = modo.seleccionarMapa(nombreMapa);

    if (resultado.yaEncontrado) return;

    agregarMapaSeleccionadoUI(nombreMapa, resultado.esMapaCorrecto);

    if (resultado.esMapaCorrecto) {
        // Ocultar buscador y mostrar mapa completo
        document.getElementById("buscadorModoMapa").hidden = true;
        mostrarMapaCompleto();
    }

    // Limpiar input y sugerencias
    document.getElementById("inputBuscarModoMapa").value = "";
    document.getElementById("listaSugerenciasModoMapa").hidden = true;
}

function agregarMapaSeleccionadoUI(nombreMapa, esCorrecto) {
    const contenedor = document.getElementById("contenedorMapasSeleccionados");

    const div = document.createElement('div');
    div.className = `mapaSeleccionado ${esCorrecto ? 'correcto' : 'incorrecto'}`;

    const img = document.createElement('img');
    img.src = modo.mapaImagenes[nombreMapa] + ".webp";
    img.alt = nombreMapa;

    const span = document.createElement('span');
    span.textContent = nombreMapa;

    div.appendChild(img);
    div.appendChild(span);
    contenedor.appendChild(div);
}

function mostrarMapaCompleto() {
    const contenedorMapa = document.getElementById("contenedorMapaCompleto");
    const imagenMapa = document.getElementById("imagenMapaCompleto");

    imagenMapa.src = modo.obtenerImagenMapa();
    contenedorMapa.hidden = false;

    // Mostrar instrucciones
    document.getElementById("instruccionesMapa").textContent = "¡Correcto! Ahora haz click en el mapa para marcar la ubicación.";
}
// #endregion

// #region Marcador de ubicación
function mostrarMarcador(x, y, esCorrecto, mostrarReal = false) {
    const contenedorMapa = document.getElementById("contenedorMapaCompleto");

    // Crear marcador del usuario
    const marcador = document.createElement('div');
    marcador.className = `marcadorMapa ${esCorrecto ? 'correcto' : 'incorrecto'}`;
    marcador.style.left = `${x}%`;
    marcador.style.top = `${y}%`;
    contenedorMapa.appendChild(marcador);

    // Mostrar ubicación real solo si acertó o se quedó sin intentos
    if (mostrarReal && !esCorrecto) {
        const marcadorReal = document.createElement('div');
        marcadorReal.className = 'marcadorMapa real';
        marcadorReal.style.left = `${modo.localizacionObjetivo.lon}%`;
        marcadorReal.style.top = `${modo.localizacionObjetivo.lat}%`;
        contenedorMapa.appendChild(marcadorReal);
    }
}

function mostrarResultadoUbicacion(resultado) {
    const instrucciones = document.getElementById("instruccionesMapa");

    if (resultado.esCorrecta) {
        instrucciones.textContent = `¡Perfecto! Acertaste la ubicación. Distancia: ${resultado.distancia} unidades.`;
        instrucciones.className = "instrucciones correcto";
        
        // Si es modo aleatorio, mostrar opción de continuar
        if (!modo.esMapaDiario) {
            mostrarOpcionContinuar();
        }
    } else if (resultado.sinIntentos) {
        instrucciones.textContent = `¡Sin intentos! La distancia fue de ${resultado.distancia} unidades. Se muestra la ubicación correcta.`;
        instrucciones.className = "instrucciones incorrecto";
    } else {
        instrucciones.textContent = `Fallaste. Distancia: ${resultado.distancia} unidades. Te quedan ${resultado.intentosRestantes} intento(s).`;
        instrucciones.className = "instrucciones incorrecto";
    }
}
// #endregion

// #region Reiniciar modo
function reiniciarModo() {
    // Limpiar UI
    document.getElementById("contenedorMapasSeleccionados").innerHTML = '';
    document.getElementById("inputBuscarModoMapa").value = '';
    document.getElementById("listaSugerenciasModoMapa").hidden = true;
    document.getElementById("buscadorModoMapa").hidden = false;
    document.getElementById("contenedorMapaCompleto").hidden = true;
    document.getElementById("instruccionesMapa").textContent = "¿De qué mapa es esta ubicación?";
    document.getElementById("instruccionesMapa").className = "instrucciones";

    // Limpiar marcadores
    const contenedorMapa = document.getElementById("contenedorMapaCompleto");
    contenedorMapa.querySelectorAll('.marcadorMapa').forEach(m => m.remove());
    
    // Reiniciar modo
    modo = new ModoMapa(esModoMapaDiario);
    modo.inicializarModo().then(() => {
        mostrarImagenUbicacion();
    });

    // Cerrar modal
    document.getElementById("modalSettingsModoMapa").style.display = "none";
}

function mostrarOpcionContinuar() {
    const html = `
        <article class="continuar-jugando">
            <h3>¡Felicidades! ¿Quieres continuar con otro mapa?</h3>
            <div class="botones-continuar">
                <button id="btnContinuarSiMapa" class="btn-continuar-si">Sí, continuar</button>
                <button id="btnContinuarNoMapa" class="btn-continuar-no">No, terminar</button>
            </div>
        </article>
    `;
    
    const contenedor = document.getElementById('contenedorMapasSeleccionados');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('btnContinuarSiMapa').addEventListener('click', async function() {
            // Limpiar UI
            document.getElementById("contenedorMapasSeleccionados").innerHTML = '';
            document.getElementById("inputBuscarModoMapa").value = '';
            document.getElementById("listaSugerenciasModoMapa").hidden = true;
            document.getElementById("buscadorModoMapa").hidden = false;
            document.getElementById("contenedorMapaCompleto").hidden = true;
            document.getElementById("instruccionesMapa").textContent = "¿De qué mapa es esta ubicación?";
            document.getElementById("instruccionesMapa").className = "instrucciones";
            
            // Limpiar marcadores
            const contenedorMapa = document.getElementById("contenedorMapaCompleto");
            contenedorMapa.querySelectorAll('.marcadorMapa').forEach(m => m.remove());
            
            // Reiniciar modo
            modo = new ModoMapa(false);
            await modo.inicializarModo();
            mostrarImagenUbicacion();
        });
        
        document.getElementById('btnContinuarNoMapa').addEventListener('click', function() {
            this.parentElement.parentElement.remove();
        });
    }
}
// #endregion