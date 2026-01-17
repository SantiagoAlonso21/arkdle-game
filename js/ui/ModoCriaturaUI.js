import { ModoCriatura } from "../modos/ModoCriatura.js";

let modo;
let eventListenersConfigurados = false;

export async function iniciarModoCriatura() {
    // Solo crear una nueva instancia si no existe
    if (!modo) {
        modo = new ModoCriatura(true);
        await modo.inicializarModo();
    }

    document.getElementById("vistaModoCriatura").style.display = "flex";
    document.getElementById("headerModos").style.display = "flex";

    // Mostrar imagen inicial con transformación
    actualizarImagenCriatura();
    
    // Si ya se encontró, mostrar estado de victoria
    if (modo.criaturaEncontrada) {
        mostrarVictoria(modo.criaturaObjetivo);
    } else {
        actualizarTransformacionImagen();
    }

    // Configurar event listeners solo la primera vez
    if (!eventListenersConfigurados) {
        configurarEventListeners();
        eventListenersConfigurados = true;
    }
}

function configurarEventListeners() {
    // Navegabilidad dentro del Modo Criatura
    document.getElementById("btnNavCriaturaADino").addEventListener("click", function () {
        location.hash = '/modoDinosaurio';
    });

    document.getElementById("btnNavCriaturaAMapa").addEventListener("click", function () {
        location.hash = '/modoMapa';
    });

    document.getElementById("btnNavCriaturaACriatura").addEventListener("click", function () {
        location.hash = '/modoCriatura';
    });

    document.getElementById("btnNavCriaturaAMontura").addEventListener("click", function () {
        location.hash = '/modoMontura';
    });

    // Input de busqueda de criaturas
    const inputBuscarModoCriatura = document.getElementById('inputBuscarModoCriatura');
    inputBuscarModoCriatura.addEventListener('input', function () {
        cargarSugerencias(this.value.trim());
        posListaSugerencias = 0;
        destacarSugerenciaUI(posListaSugerencias);
    });

    let posListaSugerencias = 0;
    inputBuscarModoCriatura.addEventListener('keydown', function (event) {
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
                if (modo.listaDinosSugeridos.length > 0 && !modo.criaturaEncontrada) {
                    modo.seleccionarCriatura(modo.listaDinosSugeridos[posListaSugerencias]);
                }
                break;
        }

        destacarSugerenciaUI(posListaSugerencias);
    });

    // Settings - Abrir modal
    document.getElementById('btnSettingsModoDino').addEventListener('click', function () {
        document.getElementById('modalSettingsModoCriatura').style.display = 'flex';
    });

    // Settings - Radio buttons
    document.getElementById('radioDinoDiarioModoCriatura').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoCriatura(true);
            document.getElementById('modalSettingsModoCriatura').style.display = 'none';
        }
    });

    document.getElementById('radioDinoAleatorioModoCriatura').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoCriatura(false);
            document.getElementById('modalSettingsModoCriatura').style.display = 'none';
        }
    });

    // Settings - Switches de rotación y zoom
    document.getElementById('switchRotacionModoCriatura').addEventListener('change', function () {
        modo.setRotacionActiva(this.checked);
    });

    document.getElementById('switchZoomModoCriatura').addEventListener('change', function () {
        modo.setZoomActivo(this.checked);
    });

    document.getElementById('cerrarModalSettingsModoCriatura').addEventListener('click', function () {
        document.getElementById('modalSettingsModoCriatura').style.display = 'none';
    });
}

// #region Imagen
function actualizarImagenCriatura() {
    const imgCriatura = document.getElementById('imagenCriatura');
    imgCriatura.src = modo.obtenerImagenActual();
    imgCriatura.alt = "Silueta de criatura a adivinar";
}

export function actualizarTransformacionImagen() {
    const imgCriatura = document.getElementById('imagenCriatura');
    const transformacion = modo.obtenerTransformacion();
    imgCriatura.style.transform = `rotate(${transformacion.rotacion}deg) scale(${transformacion.zoom})`;
}

function resetearTransformacionImagen() {
    const imgCriatura = document.getElementById('imagenCriatura');
    imgCriatura.style.transform = 'rotate(0deg) scale(1.5)';
}
// #endregion

// #region Sugerencias
function cargarSugerencias(criaturaBuscada) {
    const listaSugerenciasUI = document.getElementById('listaSugerenciasModoCriatura');
    listaSugerenciasUI.innerHTML = '';

    modo.obtenerSugerencias(criaturaBuscada);

    const limite = Math.min(modo.listaDinosSugeridos.length, 7);
    for (let i = 0; i < limite; i++) {
        listaSugerenciasUI.appendChild(crearSugerenciaCriaturaUI(modo.listaDinosSugeridos[i]));
    }

    if (modo.listaDinosSugeridos.length === 0 || criaturaBuscada.trim() === '') {
        listaSugerenciasUI.hidden = true;
    } else {
        listaSugerenciasUI.hidden = false;
    }
}

function crearSugerenciaCriaturaUI(dino) {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = dino.pathDinoModeImg + ".webp";
    img.alt = dino.name;

    const span = document.createElement('span');
    span.textContent = dino.name;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener('click', () => {
        if (!modo.criaturaEncontrada) {
            modo.seleccionarCriatura(dino);
        }
    });

    return li;
}

function destacarSugerenciaUI(indice) {
    const listaSugerencias = document.getElementById('listaSugerenciasModoCriatura');
    const items = listaSugerencias.querySelectorAll('li');

    items.forEach(item => item.classList.remove('destacado'));

    if (items[indice]) {
        items[indice].classList.add('destacado');
        items[indice].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}
// #endregion

// #region Seleccion
export function seleccionarCriaturaUI(criaturaSeleccionada, esCorrecta) {
    const input = document.getElementById('inputBuscarModoCriatura');
    input.value = '';
    cargarSugerencias('');

    // Si es un error, actualizar el zoom
    if (!esCorrecta) {
        actualizarTransformacionImagen();
    }

    // Mostrar el intento en la lista
    const estiloResultado = esCorrecta
        ? 'background-color: rgba(52, 211, 153, 0.15); border-color: #34d399; color: #34d399;'
        : 'background-color: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444;';

    const html = `
        <article class="criaturaSeleccionada" style="${estiloResultado}">
            <img src="${criaturaSeleccionada.pathDinoModeImg}.webp" alt="${criaturaSeleccionada.name}">
            <span>${criaturaSeleccionada.name}</span>
        </article>
    `;

    const contenedor = document.getElementById('contenedorCriaturasSeleccionadas');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
    }

    // Si acertó, mostrar mensaje de victoria
    if (esCorrecta) {
        mostrarVictoria(criaturaSeleccionada);
        
        // Si es modo aleatorio, mostrar opción de continuar
        if (!modo.esCriaturaDiaria) {
            mostrarOpcionContinuar();
        }
    }
}

function mostrarVictoria(criatura) {
    const imgCriatura = document.getElementById('imagenCriatura');
    const contenedor = document.getElementById('contenedorImagenCriatura');
    
    // Mostrar la imagen final clara
    imgCriatura.src = criatura.pathDinoModeImg + ".webp";

    // Resetear transformación
    resetearTransformacionImagen();

    // Agregar clase de victoria o efecto
    contenedor.classList.add('victoria');
}
// #endregion

// #region Settings
async function aplicarAjustesModoCriatura(ajuste) {
    // Mantener estado de los switches
    const rotacionActiva = document.getElementById('switchRotacionModoCriatura').checked;
    const zoomActivo = document.getElementById('switchZoomModoCriatura').checked;
    
    modo = new ModoCriatura(ajuste);
    modo.rotacionActiva = rotacionActiva;
    modo.zoomActivo = zoomActivo;
    
    await modo.inicializarModo();
    actualizarImagenCriatura();
    actualizarTransformacionImagen();
}

function limpiarUI() {
    document.getElementById('contenedorCriaturasSeleccionadas').innerHTML = '';
    document.getElementById('inputBuscarModoCriatura').value = '';
    document.getElementById('contenedorImagenCriatura').classList.remove('victoria');
    cargarSugerencias('');
}

function mostrarOpcionContinuar() {
    const html = `
        <article class="continuar-jugando">
            <h3>¡Felicidades! ¿Quieres continuar con otro dinosaurio?</h3>
            <div class="botones-continuar">
                <button id="btnContinuarSi" class="btn-continuar-si">Sí, continuar</button>
                <button id="btnContinuarNo" class="btn-continuar-no">No, terminar</button>
            </div>
        </article>
    `;
    
    const contenedor = document.getElementById('contenedorCriaturasSeleccionadas');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('btnContinuarSi').addEventListener('click', async function() {
            limpiarUI();
            await reiniciarModoAleatorio();
        });
        
        document.getElementById('btnContinuarNo').addEventListener('click', function() {
            // Solo ocultar el mensaje
            this.parentElement.parentElement.remove();
        });
    }
}

async function reiniciarModoAleatorio() {
    const rotacionActiva = modo.rotacionActiva;
    const zoomActivo = modo.zoomActivo;
    
    modo = new ModoCriatura(false);
    modo.rotacionActiva = rotacionActiva;
    modo.zoomActivo = zoomActivo;
    
    await modo.inicializarModo();
    actualizarImagenCriatura();
    actualizarTransformacionImagen();
}
// #endregion