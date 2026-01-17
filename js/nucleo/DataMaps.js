// Objeto location
export function location(lat, lon, map, pathMapImg) {
    this.lat = lat;
    this.lon = lon;
    this.map = map;
    this.pathMapImg = pathMapImg;
}

let listaUbicaciones = [];

async function cargarLocalizaciones() {
    if (listaUbicaciones.length === 0) {
        const response = await fetch('./data/locations.json');
        const data = await response.json();

        listaUbicaciones = data.map(d => new location(
            d.Latitude,
            d.Longitude,
            d.MapName,
            d.PathMapImg
        ));

        return listaUbicaciones;
    } else {
        return listaUbicaciones;
    }
}

export async function obtenerListaLocalizaciones() {
    return structuredClone(await cargarLocalizaciones());
}
