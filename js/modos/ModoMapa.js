import { obtenerListaLocalizaciones } from "../nucleo/DataMaps.js";
import { seleccionarBuscado } from "../nucleo/Utils.js";

export class ModoMapa {
    constructor(esMapaDiario) {
        this.mapaImagenes = {
            "The Island": "assets/maps/The_Island",
            "Scorched Earth": "assets/maps/Scorched_Earth",
            "Aberration": "assets/maps/Aberration",
            "Extinction": "assets/maps/Extinction",
            "Genesis Part 1": "assets/maps/Genesis_Part_1",
            "Genesis Part 2": "assets/maps/Genesis_Part_2",
            "Crystal Isles": "assets/maps/Crystal_Isles",
            "Valguero": "assets/maps/Valguero",
            "Ragnarok": "assets/maps/Ragnarok",
            "Lost Island": "assets/maps/Lost_Island",
            "The Center": "assets/maps/The_Center"
        };
        this.listaMapas = Object.keys(this.mapaImagenes);
        this.listaMapasSugeridos = [];
        this.listaLocalizaciones = [];
        this.localizacionObjetivo = null;
        
        // Estados del juego
        this.mapaSeleccionado = null;
        this.mapaEncontrado = false;
        this.ubicacionEncontrada = false;
        this.intentosRealizados = 0;
        this.intentosMaximos = 3;
        this.esMapaDiario = esMapaDiario;
        
        // Coordenadas marcadas por el usuario
        this.coordenadasMarcadas = null;
        
        // Distancia máxima permitida para acertar
        this.distanciaMaxima = 5;
    }

    async inicializarModo() {
        this.listaLocalizaciones = await obtenerListaLocalizaciones();
        this.localizacionObjetivo = seleccionarBuscado(this.esMapaDiario, 'mapa', this.listaLocalizaciones);
    }

    obtenerImagenUbicacion() {
        return this.localizacionObjetivo.pathMapImg + ".webp";
    }

    obtenerImagenMapa() {
        if (this.mapaSeleccionado && this.mapaImagenes[this.mapaSeleccionado]) {
            return this.mapaImagenes[this.mapaSeleccionado] + ".webp";
        }
        return null;
    }

    obtenerSugerencias(input) {
        if (input.trim() === "") {
            this.listaMapasSugeridos = [...this.listaMapas];
        } else {
            const inputLower = input.toLowerCase();
            this.listaMapasSugeridos = this.listaMapas.filter(mapa =>
                mapa.toLowerCase().includes(inputLower)
            );
        }
    }

    seleccionarMapa(nombreMapa) {
        if (this.mapaEncontrado) return { yaEncontrado: true };

        this.mapaSeleccionado = nombreMapa;
        const esMapaCorrecto = nombreMapa === this.localizacionObjetivo.map;

        if (esMapaCorrecto) {
            this.mapaEncontrado = true;
        } else {
            // Eliminar el mapa incorrecto de la lista
            this.listaMapas = this.listaMapas.filter(m => m !== nombreMapa);
        }

        return {
            esMapaCorrecto,
            mapaSeleccionado: nombreMapa,
            mapaCorrecto: esMapaCorrecto ? this.localizacionObjetivo.map : null
        };
    }

    marcarUbicacion(x, y) {
        // Verificar si se pueden hacer más intentos
        if (!this.mapaEncontrado || this.ubicacionEncontrada || this.intentosRealizados >= this.intentosMaximos) return null;

        this.intentosRealizados++;
        this.coordenadasMarcadas = { x, y };

        // Calcular distancia entre punto marcado y ubicación real
        const distancia = this.calcularDistancia(
            x, y,
            this.localizacionObjetivo.lon,
            this.localizacionObjetivo.lat
        );

        const esCorrecta = distancia <= this.distanciaMaxima;

        if (esCorrecta) {
            this.ubicacionEncontrada = true;
        }

        const intentosRestantes = this.intentosMaximos - this.intentosRealizados;
        const sinIntentos = intentosRestantes === 0;

        // Devolver coordenadas reales si acertó o si se quedó sin intentos
        return {
            esCorrecta,
            distancia: Math.round(distancia * 10) / 10,
            coordenadasMarcadas: { x, y },
            coordenadasReales: (esCorrecta || sinIntentos) ? {
                x: this.localizacionObjetivo.lon,
                y: this.localizacionObjetivo.lat
            } : null,
            intentosRestantes,
            sinIntentos
        };
    }

    calcularDistancia(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}