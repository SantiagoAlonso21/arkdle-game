import { ModoMontura } from "../modos/ModoMontura.js";

let modo;
let eventListenersConfigurados = false;

export async function iniciarModoMontura() {
    // Solo crear una nueva instancia si no existe
    if (!modo) {
        modo = new ModoMontura(true);
        await modo.inicializarModo();
    }

    document.getElementById("vistaModoMontura").style.display = "flex";
    document.getElementById("headerModos").style.display = "flex";

    // Cargar imagen inicial
    cargarImagenMontura();

    // Configurar event listeners solo la primera vez
    if (!eventListenersConfigurados) {
        configurarEventListeners();
        eventListenersConfigurados = true;
    }
}

function configurarEventListeners() {
    // Navegabilidad dentro del Modo Montura
    document.getElementById("btnNavMonturaADino").addEventListener("click", function() {
        location.hash = '/modoDinosaurio';
    });

    document.getElementById("btnNavMonturaAMapa").addEventListener("click", function() {
        location.hash = '/modoMapa';
    });

    document.getElementById("btnNavMonturaACriatura").addEventListener("click", function() {
        location.hash = '/modoCriatura';
    });

    document.getElementById("btnNavMonturaAMontura").addEventListener("click", function() {
        location.hash = '/modoMontura';
    });

    // Input de busqueda de monturas
    const inputBuscarModoMontura = document.getElementById('inputBuscarModoMontura');
    
    let posListaSugerencias = 0;
    inputBuscarModoMontura.addEventListener('input', function() {
        cargarSugerencias(this.value.trim());
        posListaSugerencias = 0;
        destacarSugerenciaUI(posListaSugerencias);
    });

    inputBuscarModoMontura.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowUp':
                posListaSugerencias = Math.max(0, posListaSugerencias - 1);
                break;
            case 'ArrowDown':
                posListaSugerencias = Math.min(Math.min(6, modo.listaMonturasSugeridas.length - 1), posListaSugerencias + 1);
                break;
            case 'Enter':
                if (modo.listaMonturasSugeridas.length > 0 && !modo.monturaEncontrada) {
                    modo.seleccionarMontura(modo.listaMonturasSugeridas[posListaSugerencias]);
                }
                break;
        }
        destacarSugerenciaUI(posListaSugerencias);
    });

    // Settings - Abrir modal
    document.getElementById('btnSettingsModoDino').addEventListener('click', function () {
        document.getElementById('modalSettingsModoMontura').style.display = 'flex';
    });

    // Settings - Radio buttons
    document.getElementById('radioMonturaDiariaModoMontura').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoMontura(true);
            document.getElementById('modalSettingsModoMontura').style.display = 'none';
        }
    });

    document.getElementById('radioMonturaAleatoriaModoMontura').addEventListener('change', async function () {
        if (this.checked) {
            limpiarUI();
            await aplicarAjustesModoMontura(false);
            document.getElementById('modalSettingsModoMontura').style.display = 'none';
        }
    });

    document.getElementById('cerrarModalSettingsModoMontura').addEventListener('click', function () {
        document.getElementById('modalSettingsModoMontura').style.display = 'none';
    });
}

// #region Imagen
function cargarImagenMontura() {
    const imagenMontura = document.getElementById("imagenMontura");
    imagenMontura.src = modo.obtenerImagenActual();
    imagenMontura.alt = "Imagen de la montura a adivinar";
}
// #endregion

// #region Sugerencias
function cargarSugerencias(monturaBuscada) {
    const listaSugerenciasUI = document.getElementById('listaSugerenciasModoMontura');
    listaSugerenciasUI.innerHTML = '';

    modo.obtenerSugerencias(monturaBuscada);

    const limite = Math.min(modo.listaMonturasSugeridas.length, 7);
    for (let i = 0; i < limite; i++) {
        listaSugerenciasUI.appendChild(crearSugerenciaMonturaUI(modo.listaMonturasSugeridas[i]));
    }

    if (modo.listaMonturasSugeridas.length === 0 || monturaBuscada.trim() === '') {
        listaSugerenciasUI.hidden = true;
    } else {
        listaSugerenciasUI.hidden = false;
    }
}

function crearSugerenciaMonturaUI(montura) {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = montura.pathSaddleModeImg.split(",")[0] + ".webp";
    img.alt = montura.name;

    const span = document.createElement('span');
    span.textContent = montura.name;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener('click', () => {
        if (!modo.monturaEncontrada) {
            modo.seleccionarMontura(montura);
        }
    });

    return li;
}

function destacarSugerenciaUI(indice) {
    const listaSugerencias = document.getElementById('listaSugerenciasModoMontura');
    const items = listaSugerencias.querySelectorAll('li');

    items.forEach(item => item.classList.remove('destacado'));

    if (items[indice]) {
        items[indice].classList.add('destacado');
        items[indice].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}
// #endregion

// #region Seleccion
export function seleccionarMonturaUI(monturaSeleccionada, esCorrecta) {
    const input = document.getElementById('inputBuscarModoMontura');
    input.value = '';
    cargarSugerencias('');

    let indexMostrar = modo.monturaEncontrada ? 0 : modo.monturaActualImagenIndex;

    // Mostrar el intento en la lista
    const estiloResultado = esCorrecta
        ? 'background-color: rgba(52, 211, 153, 0.15); border-color: #34d399; color: #34d399;'
        : 'background-color: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444;';

    const html = `
        <article class="monturaSeleccionada" style="${estiloResultado}">
            <img src="${monturaSeleccionada.pathSaddleModeImg.split(",")[indexMostrar]}.webp" alt="${monturaSeleccionada.name}">
            <span>${monturaSeleccionada.name}</span>
        </article>
    `;

    const contenedor = document.getElementById('contenedorMonturasSeleccionadas');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
    }
    
    // Si encontró la montura y es modo aleatorio, mostrar opción de continuar
    if (esCorrecta && !modo.esMonturaDiaria) {
        mostrarOpcionContinuar();
    }
}
// #endregion

// #region Settings
async function aplicarAjustesModoMontura(ajuste) {
    modo = new ModoMontura(ajuste);
    await modo.inicializarModo();
    cargarImagenMontura();
}

function limpiarUI() {
    document.getElementById('contenedorMonturasSeleccionadas').innerHTML = '';
    document.getElementById('inputBuscarModoMontura').value = '';
    cargarSugerencias('');
}

function mostrarOpcionContinuar() {
    const html = `
        <article class="continuar-jugando">
            <h3>¡Felicidades! ¿Quieres continuar con otra montura?</h3>
            <div class="botones-continuar">
                <button id="btnContinuarSiMontura" class="btn-continuar-si">Sí, continuar</button>
                <button id="btnContinuarNoMontura" class="btn-continuar-no">No, terminar</button>
            </div>
        </article>
    `;
    
    const contenedor = document.getElementById('contenedorMonturasSeleccionadas');
    if (contenedor) {
        contenedor.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('btnContinuarSiMontura').addEventListener('click', async function() {
            limpiarUI();
            await reiniciarModoAleatorio();
        });
        
        document.getElementById('btnContinuarNoMontura').addEventListener('click', function() {
            this.parentElement.parentElement.remove();
        });
    }
}

async function reiniciarModoAleatorio() {
    modo = new ModoMontura(false);
    await modo.inicializarModo();
    cargarImagenMontura();
}
// #endregion