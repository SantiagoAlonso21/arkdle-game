import { obtenerListaDinos } from "../nucleo/DataDino.js";
import { seleccionarBuscado } from "../nucleo/Utils.js";
import { buscarDinosaurios } from "../nucleo/DataDino.js";
import { seleccionarDinoUI } from "../ui/ModoDinoUI.js";

export class ModoDino {
    constructor(esDinoDiario) {
        this.dinoEncontrado = false;
        this.esDinoDiario = esDinoDiario;
        this.dinoObjetivo = null;
        this.cantIntentos = 0;
        this.listaDinos = [];
        this.listaDinosSugeridos = [];
        this.pistasDisponibles = {
            pista1: false,
            pista2: false,
            pista3: false
        };
    }

    async inicializarModo() {
        this.listaDinos = await obtenerListaDinos();
        this.dinoObjetivo = await seleccionarBuscado(this.esDinoDiario, 'dino', this.listaDinos);
    }

    obtenerSugerencias(input) {
        this.listaDinosSugeridos = buscarDinosaurios(input, this.listaDinos);
    }

    seleccionarDino(dino) {
        this.cantIntentos++;

        this.desbloquearPista();

        // Quito el dino seleccionado de los dinos posibles
        this.listaDinos = this.listaDinos.filter(d => d.name !== dino.name);

        // Realizar todas las comparaciones
        const resultados = {
            esElCorrecto: dino.name === this.dinoObjetivo.name,
            diet: this.compararDieta(dino),
            temperament: this.compararTemperamento(dino),
            tamingMethod: this.compararTameo(dino),
            size: this.compararTamaño(dino),
            dragWeight: this.compararPesoArrastre(dino),
            maps: this.compararMapas(dino)
        };

        if (resultados.esElCorrecto) {
            this.dinoEncontrado = true;
        }

        // Pasar el dino y los resultados a la UI
        seleccionarDinoUI(dino, resultados);
    }

    compararDieta(dinoSeleccionado) {
        return this.dinoObjetivo.diet == dinoSeleccionado.diet;
    }

    compararTemperamento(dinoSeleccionado) {
        return this.dinoObjetivo.temperament == dinoSeleccionado.temperament;
    }

    compararTameo(dinoSeleccionado) {
        return this.dinoObjetivo.tamingMethod == dinoSeleccionado.tamingMethod;
    }

    compararTamaño(dinoSeleccionado) {
        // Comparo el índice en una lista predefinida de tamaños para saber
        // si el tamaño del dino seleccionado es mayor, menor o igual al del dino buscado
        const listaTamaños = ["Pequeño", "Mediano", "Grande", "Muy Grande", "Gigantesco"];
        let indiceBuscado = listaTamaños.indexOf(this.dinoObjetivo.size);
        let indiceSeleccionado = listaTamaños.indexOf(dinoSeleccionado.size);
        return indiceBuscado - indiceSeleccionado;
    }

    compararPesoArrastre(dinoSeleccionado) {
        // Comparo los pesos de arrastre para saber si el del dino
        // seleccionado tiene es mayor, menor o igual al del dino buscado
        const pesoBuscado = parseInt(this.dinoObjetivo.dragWeight);
        const pesoSeleccionado = parseInt(dinoSeleccionado.dragWeight);
        return pesoBuscado - pesoSeleccionado;
    }

    compararMapas(dinoSeleccionado) {
        const mapasBuscado = this.dinoObjetivo.maps;
        const mapasSeleccionado = dinoSeleccionado.maps;
        let coincidencias = 0;

        // Doble bucle manual para contar coincidencias
        for (let i = 0; i < mapasSeleccionado.length; i++) {
            for (let j = 0; j < mapasBuscado.length; j++) {
                if (mapasSeleccionado[i] === mapasBuscado[j]) {
                    coincidencias++;
                    break;
                }
            }
        }

        // 1. VERDE: Coincidencia total
        if (coincidencias === mapasBuscado.length && mapasSeleccionado.length === mapasBuscado.length) {
            return 1;
        }

        // 0. ROJO: Ninguna coincidencia
        if (coincidencias === 0) {
            return 0;
        }

        // AMARILLOS: Coincidencia parcial (coincidencias > 0)
        if (mapasSeleccionado.length < mapasBuscado.length) {
            return 2; // Amarillo arriba (faltan mapas)
        } else {
            return 3; // Amarillo abajo (sobran mapas o cantidad igual con contenido distinto)
        }
    }

    desbloquearPista() {
        if (this.cantIntentos === 3) {
            this.pistasDisponibles.pista1 = true;
        } else if (this.cantIntentos === 5) {
            this.pistasDisponibles.pista2 = true;
        } else if (this.cantIntentos === 7) {
            this.pistasDisponibles.pista3 = true;
        }
    }

    obtenerPista(numeroPista) {
        if (numeroPista === 1 && this.pistasDisponibles.pista1) {
            return this.dinoObjetivo.basicClue;
        } else if (numeroPista === 2 && this.pistasDisponibles.pista2) {
            return this.dinoObjetivo.mediumClue;
        } else if (numeroPista === 3 && this.pistasDisponibles.pista3) {
            return this.dinoObjetivo.strongClue;
        }
    }
}