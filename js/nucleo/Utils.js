function seededRandom(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function generarDiario(modo, lista) {
    const hoy = new Date();
    // Extraigo la fecha actual
    let semillaDiaria = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    
    if (modo === 'criatura') {
        semillaDiaria += 1000000;
    } else if (modo === 'mapa') {
        semillaDiaria += 2000000;
    } else if (modo === 'montura') {
        semillaDiaria += 3000000;
    }
    
    const random = seededRandom(semillaDiaria);

    const indice = Math.floor(random() * lista.length);
    let buscado = lista[indice];
    return buscado;
}

function generarAleatorio(lista) {
    const indice = Math.floor(Math.random() * lista.length);
    let buscado = lista[indice];
    return buscado;
}

export function seleccionarBuscado(esDiario, modo, lista) {
    if (esDiario) {
        return generarDiario(modo, lista);
    } else {
        return generarAleatorio(lista);
    }
}
