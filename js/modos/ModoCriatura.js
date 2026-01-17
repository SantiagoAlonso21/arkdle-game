import { obtenerListaDinos, buscarDinosaurios } from "../nucleo/DataDino.js";
import { seleccionarBuscado } from "../nucleo/Utils.js";
import { seleccionarCriaturaUI, actualizarTransformacionImagen } from "../ui/ModoCriaturaUI.js";

export class ModoCriatura {
    constructor(esCriaturaDiaria) {
        this.criaturaEncontrada = false;
        this.esCriaturaDiaria = esCriaturaDiaria;
        this.criaturaObjetivo = null;
        this.cantIntentos = 0;
        this.listaDinos = [];
        this.listaDinosSugeridos = [];
        this.rotacionActiva = true;
        this.zoomActivo = true;
        this.rotacionInicial = 0; // Rotación fija para esta partida
        this.rotacionActual = 0;
        this.zoomActual = 3.0;
    }

    async inicializarModo() {
        this.listaDinos = await obtenerListaDinos();
        this.criaturaObjetivo = await seleccionarBuscado(this.esCriaturaDiaria, 'criatura', this.listaDinos);
        this.generarTransformacionAleatoria();
    }

    obtenerSugerencias(input) {
        this.listaDinosSugeridos = buscarDinosaurios(input, this.listaDinos);
    }

    obtenerImagenActual() {
        // Siempre devuelve la imagen 1 (silueta)
        return this.criaturaObjetivo.pathCreatureModeImg1 + ".webp";
    }

    generarTransformacionAleatoria() {
        // Generar rotación aleatoria entre -180 y 180 grados (solo una vez)
        this.rotacionInicial = Math.floor(Math.random() * 361) - 180;
        
        if (this.rotacionActiva) {
            this.rotacionActual = this.rotacionInicial;
        } else {
            this.rotacionActual = 0;
        }

        // El zoom empieza en 3.0 y se reduce con cada error
        if (this.zoomActivo) {
            this.zoomActual = 3.0;
        } else {
            this.zoomActual = 2.0;
        }
    }

    obtenerTransformacion() {
        return {
            rotacion: this.rotacionActual,
            zoom: this.zoomActual
        };
    }

    setRotacionActiva(activa) {
        this.rotacionActiva = activa;
        if (!activa) {
            this.rotacionActual = 0;
        } else {
            // Usar la rotación inicial, no generar una nueva
            this.rotacionActual = this.rotacionInicial;
        }
        actualizarTransformacionImagen();
    }

    setZoomActivo(activo) {
        this.zoomActivo = activo;
        if (!activo) {
            this.zoomActual = 2.0;
        } else {
            // Calcular zoom basado en intentos actuales
            this.zoomActual = Math.max(2.0, 3.0 - (this.cantIntentos * 0.25));
        }
        actualizarTransformacionImagen();
    }

    reducirZoom() {
        // Reducir zoom progresivamente: 3.0 -> 2.75 -> 2.50 ... -> 2.0
        // Cada error reduce el zoom en 0.25
        if (this.zoomActivo) {
            this.zoomActual = Math.max(2.0, 3.0 - (this.cantIntentos * 0.25));
        }
    }

    seleccionarCriatura(dino) {
        const esCorrecta = dino.name === this.criaturaObjetivo.name;

        if (!esCorrecta) {
            this.cantIntentos++;
            this.reducirZoom();
        } else {
            this.criaturaEncontrada = true;
        }

        // Quitar el dino seleccionado de los posibles
        this.listaDinos = this.listaDinos.filter(d => d.name !== dino.name);

        // Pasar resultado a la UI
        seleccionarCriaturaUI(dino, esCorrecta);
    }
}