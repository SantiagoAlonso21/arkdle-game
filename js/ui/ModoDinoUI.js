import { buscarDinosaurios } from "../nucleo/DataDino.js";
import { ModoDino } from "../modos/ModoDino.js";

let modo;
let eventListenersConfigurados = false;

export async function iniciarModoDino() {
    // Solo crear una nueva instancia si no existe
    if (!modo) {
        modo = new ModoDino(true);
        await modo.inicializarModo();
    }

    document.getElementById("vistaModoDino").style.display = "flex";
    document.getElementById("headerModos").style.display = "flex";

    // Configurar event listeners solo la primera vez
    if (!eventListenersConfigurados) {
        configurarEventListeners();
        eventListenersConfigurados = true;
    }

    // Actualizar pistas cada vez que se entra al modo
    actualizarEstadoPistas();
}

function configurarEventListeners() {
    // Navegabilidad dentro del Modo Dinosaurio
    document.getElementById("btnNavDinoADino").addEventListener("click", function () {
        location.hash = '/modoDinosaurio';
    });

    document.getElementById("btnNavDinoAMapa").addEventListener("click", function () {
        location.hash = '/modoMapa';
    });

    document.getElementById("btnNavDinoACriatura").addEventListener("click", function () {
        location.hash = '/modoCriatura';
    });

    document.getElementById("btnNavDinoAMontura").addEventListener("click", function () {
        location.hash = '/modoMontura';
    });

    // Input de busqueda de dinosaurios
    const inputBuscarModoDino = document.getElementById('inputBuscarModoDino');
    inputBuscarModoDino.addEventListener('input', function () {
        cargarSugerencias(this.value.trim());
        posListaSugerencias = 0;
        destacarSugerenciaUI(posListaSugerencias);
    });

    let posListaSugerencias = 0;
    inputBuscarModoDino.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                posListaSugerencias = Math.max(0, posListaSugerencias - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                posListaSugerencias = Math.min(Math.min(6, modo.listaDinosSugeridos.length - 1), posListaSugerencias + 1);
                break;
            case 'Enter':
                event.preventDefault();
                if (modo.listaDinosSugeridos.length > 0 && !modo.dinoEncontrado) {
                    modo.seleccionarDino(modo.listaDinosSugeridos[posListaSugerencias]);
                }
                break;
        }

        destacarSugerenciaUI(posListaSugerencias);
    });

    // Settings
    document.getElementById('btnSettingsModoDino').addEventListener('click', function () {
        document.getElementById('modalSettingsModoDino').style.display = 'flex';
    });

    document.getElementById('radioDinoDiarioModoDino').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoDino(true);
            actualizarEstadoPistas();
            document.getElementById('modalSettingsModoDino').style.display = 'none';
        }
    });

    document.getElementById('radioDinoAleatorioModoDino').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoDino(false);
            actualizarEstadoPistas();
            document.getElementById('modalSettingsModoDino').style.display = 'none';
        }
    });

    document.getElementById('cerrarModalSettingsModoDino').addEventListener('click', function () {
        document.getElementById('modalSettingsModoDino').style.display = 'none';
    });

    // Sistema de pistas
    configurarPistas();
}

// #region Pistas
function configurarPistas() {
    const btnsPistas = document.querySelectorAll('.btnPista');
    const modalPistas = document.getElementById('modalPistasModoDino');
    const btnCerrarModal = document.getElementById('cerrarModalPistasModoDino');

    btnsPistas.forEach(btn => {
        btn.addEventListener('click', function () {
            const numeroPista = parseInt(this.getAttribute('data-pista'));
            if (numeroPista === 1 && modo.pistasDisponibles.pista1) {
                const textoPista = modo.obtenerPista(1);
                mostrarPista(1, textoPista);
            } else if (numeroPista === 2 && modo.pistasDisponibles.pista2) {
                const textoPista = modo.obtenerPista(2);
                mostrarPista(2, textoPista);
            } else if (numeroPista === 3 && modo.pistasDisponibles.pista3) {
                const textoPista = modo.obtenerPista(3);
                mostrarPista(3, textoPista);
            }
        });
    });

    btnCerrarModal.addEventListener('click', function () {
        modalPistas.style.display = 'none';
    });
}

function actualizarEstadoPistas() {
    const btnsPistas = document.querySelectorAll('.btnPista');

    btnsPistas.forEach(btn => {
        const numeroPista = parseInt(btn.getAttribute('data-pista'));
        const emoji = btn.querySelector('span:first-child');
        const contador = btn.querySelector('.cantIntentos');

        let desbloqueada = false;
        let intentosNecesarios = 0;

        if (numeroPista === 1) {
            desbloqueada = modo.pistasDisponibles.pista1;
            intentosNecesarios = 3;
        } else if (numeroPista === 2) {
            desbloqueada = modo.pistasDisponibles.pista2;
            intentosNecesarios = 5;
        } else if (numeroPista === 3) {
            desbloqueada = modo.pistasDisponibles.pista3;
            intentosNecesarios = 7;
        }

        if (desbloqueada) {
            emoji.textContent = '🔓';
            contador.textContent = '';
            btn.classList.add('desbloqueada');
        } else {
            const faltantes = intentosNecesarios - modo.cantIntentos;
            contador.textContent = `(${faltantes} más)`;
            btn.classList.remove('desbloqueada');
        }
    });
}

function mostrarPista(numeroPista, textoPista) {
    const modalPistas = document.getElementById('modalPistasModoDino');

    const tituloPista = document.getElementById('tituloPista');
    tituloPista.value = `Pista ${numeroPista}`;

    const pistaTexto = document.getElementById('pistaTextoModoDino');
    pistaTexto.textContent = textoPista;

    modalPistas.style.display = 'flex';
}
// #endregion

// #region Sugerencias
function cargarSugerencias(dinoBuscado) {
    const listaSugerenciasUI = document.getElementById('listaSugerenciasModoDino');
    listaSugerenciasUI.innerHTML = '';

    modo.obtenerSugerencias(dinoBuscado);

    const limite = Math.min(modo.listaDinosSugeridos.length, 7);
    for (let i = 0; i < limite; i++) {
        listaSugerenciasUI.appendChild(crearSugerenciaDinoUI(modo.listaDinosSugeridos[i]));
    }

    if (modo.listaDinosSugeridos.length === 0 || dinoBuscado.trim() === '') {
        listaSugerenciasUI.hidden = true;
    } else {
        listaSugerenciasUI.hidden = false;
    }
}

function crearSugerenciaDinoUI(dino) {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = dino.pathDinoModeImg + ".webp";
    img.alt = dino.name;

    const span = document.createElement('span');
    span.textContent = dino.name;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener('click', () => {
        if (!modo.dinoEncontrado) {
            modo.seleccionarDino(dino);
        }
    });

    return li;
}

function destacarSugerenciaUI(indice) {
    const listaSugerencias = document.getElementById('listaSugerenciasModoDino');
    const items = listaSugerencias.querySelectorAll('li');

    // Remover destacado de todos
    items.forEach(item => item.classList.remove('destacado'));

    // Destacar el seleccionado
    if (items[indice]) {
        items[indice].classList.add('destacado');

        // Asegurarse de que el elemento destacado esté visible
        items[indice].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}
// #endregion

// #region Seleccion

export function seleccionarDinoUI(dinoSeleccionado, resultados) {
    const input = document.getElementById('inputBuscarModoDino');
    input.value = '';
    cargarSugerencias('');

    // Calcular estilos
    const estiloDiet = obtenerEstiloComparacion(resultados.diet);
    const estiloTemp = obtenerEstiloComparacion(resultados.temperament);
    const estiloTaming = obtenerEstiloComparacion(resultados.tamingMethod);
    const estiloSize = obtenerEstiloComparacion(resultados.size === 0);
    const estiloDrag = obtenerEstiloComparacion(resultados.dragWeight === 0);

    const flechaSize = resultados.size > 0 ? ' ↑' : resultados.size < 0 ? ' ↓' : '';
    const flechaDrag = resultados.dragWeight > 0 ? ' ↑' : resultados.dragWeight < 0 ? ' ↓' : '';

    let estiloMaps, flechaMaps = '';
    if (resultados.maps === 1) {
        estiloMaps = obtenerEstiloComparacion(true);
    } else if (resultados.maps === 0) {
        estiloMaps = obtenerEstiloComparacion(false);
    } else {
        estiloMaps = 'background-color: rgba(251, 191, 36, 0.15); border-color: #fbbf24; color: #fbbf24;';
        flechaMaps = resultados.maps === 2 ? ' ↑' : ' ↓';
    }

    const html = `
        <article class="dinoSeleccionado">
            <header>
                <h3>${dinoSeleccionado.name}</h3>
            </header>
            <div class="datosDinoSeleccionado">
                <div class="datoDino">
                    <img src="${dinoSeleccionado.pathDinoModeImg}.webp" alt="${dinoSeleccionado.name}">
                </div>
                <div class="datoDino" style="${estiloDiet}">
                    <h3>Dieta</h3>
                    <span>${dinoSeleccionado.diet}</span>
                </div>
                <div class="datoDino" style="${estiloTemp}">
                    <h3>Temperamento</h3>
                    <span>${dinoSeleccionado.temperament}</span>
                </div>
                <div class="datoDino" style="${estiloTaming}">
                    <h3>Método tameo</h3>
                    <span>${dinoSeleccionado.tamingMethod}</span>
                </div>
                <div class="datoDino" style="${estiloSize}">
                    <h3>Tamaño</h3>
                    <span>${dinoSeleccionado.size}${flechaSize}</span>
                </div>
                <div class="datoDino" style="${estiloDrag}">
                    <h3>Peso arrastre</h3>
                    <span>${dinoSeleccionado.dragWeight}${flechaDrag}</span>
                </div>
                <div class="datoDino" style="${estiloMaps}">
                    <h3>Mapas</h3>
                    <span>${dinoSeleccionado.maps}${flechaMaps}</span>
                </div>
            </div>
        </article>
    `;

    const contenedorDinosSeleccionados = document.getElementById('contenedorDinosSeleccionados');
    if (contenedorDinosSeleccionados) {
        contenedorDinosSeleccionados.insertAdjacentHTML('afterbegin', html);
    }

    actualizarEstadoPistas();
    
    // Si encontró el dino y es modo aleatorio, mostrar opción de continuar
    if (resultados.esElCorrecto && !modo.esDinoDiario) {
        mostrarOpcionContinuar();
    }
}

function obtenerEstiloComparacion(esIgual) {
    if (esIgual) {
        return 'background-color: rgba(52, 211, 153, 0.15); border-color: #34d399; color: #34d399;';
    } else {
        return 'background-color: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444;';
    }
}
// #endregion

// #region Settings

async function aplicarAjustesModoDino(ajuste) {
    modo = new ModoDino(ajuste);
    await modo.inicializarModo();
}

function limpiarUI() {
    document.getElementById('contenedorDinosSeleccionados').innerHTML = '';
    document.getElementById('inputBuscarModoDino').value = '';
    cargarSugerencias('');
}

function mostrarOpcionContinuar() {
    const html = `
        <article class="continuar-jugando">
            <h3>¡Felicidades! ¿Quieres continuar con otro dinosaurio?</h3>
            <div class="botones-continuar">
                <button id="btnContinuarSiDino" class="btn-continuar-si">Sí, continuar</button>
                <button id="btnContinuarNoDino" class="btn-continuar-no">No, terminar</button>
            </div>
        </article>
    `;
    
    const contenedor = document.getElementById('contenedorDinosSeleccionados');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('btnContinuarSiDino').addEventListener('click', async function() {
            limpiarUI();
            await reiniciarModoAleatorio();
            actualizarEstadoPistas();
        });
        
        document.getElementById('btnContinuarNoDino').addEventListener('click', function() {
            this.parentElement.parentElement.remove();
        });
    }
}

async function reiniciarModoAleatorio() {
    modo = new ModoDino(false);
    await modo.inicializarModo();
}