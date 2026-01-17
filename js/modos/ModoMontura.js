import { obtenerListaDinos } from "../nucleo/DataDino.js";
import { seleccionarBuscado } from "../nucleo/Utils.js";
import { buscarDinosaurios } from "../nucleo/DataDino.js";
import { seleccionarMonturaUI } from "../ui/ModoMonturaUI.js";

export class ModoMontura {
    constructor(esMonturaDiaria) {
        this.monturaEncontrada = false;
        this.esMonturaDiaria = esMonturaDiaria;
        this.monturaObjetivo = null;
        this.listaMonturas = [];
        this.listaMonturasSugeridas = [];
        this.monturaActualImagenIndex = 0;
    }

    async inicializarModo() {
        this.listaMonturas = (await obtenerListaDinos()).filter(d => d.pathSaddleModeImg !== "");
        this.monturaObjetivo = await seleccionarBuscado(this.esMonturaDiaria, 'montura', this.listaMonturas);
    }

    obtenerSugerencias(input) {
        this.listaMonturasSugeridas = buscarDinosaurios(input, this.listaMonturas);
    }

    obtenerImagenActual() {
        // Elige una imagen aleatoria de las disponibles para la montura
        let imagenes = this.monturaObjetivo.pathSaddleModeImg.split(",");
        this.monturaActualImagenIndex = Math.floor(Math.random() * imagenes.length);
        return imagenes[this.monturaActualImagenIndex] + ".webp";
    }

    seleccionarMontura(montura) {
        const esCorrecta = montura.name === this.monturaObjetivo.name;

        if (esCorrecta) {
            this.monturaEncontrada = true;
        }

        // Quitar el dino seleccionado de los posibles
        this.listaMonturas = this.listaMonturas.filter(d => d.name !== montura.name);

        // Pasar resultado a la UI
        seleccionarMonturaUI(montura, esCorrecta);
    }
}