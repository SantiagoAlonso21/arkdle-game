// Objeto dino
export function Dino(Name, Diet, Temperament, TamingMethod, Size,
    DragWeight, Maps, BasicClue, MediumClue, StrongClue,
    pathDinoModeImg, pathCreatureModeImg1, pathCreatureModeImg2, 
    pathCreatureModeImg3, pathSaddleModeImg) {
        this.name = Name;
        this.diet = Diet;
        this.temperament = Temperament;
        this.tamingMethod = TamingMethod;
        this.size = Size;
        this.dragWeight = DragWeight;
        this.maps = Maps;
        this.basicClue = BasicClue;
        this.mediumClue = MediumClue;
        this.strongClue = StrongClue;
        this.pathDinoModeImg = pathDinoModeImg;
        this.pathCreatureModeImg1 = pathCreatureModeImg1;
        this.pathCreatureModeImg2 = pathCreatureModeImg2;
        this.pathCreatureModeImg3 = pathCreatureModeImg3;
        this.pathSaddleModeImg = pathSaddleModeImg;
}

let listaDinos = [];

async function cargarDinos() {
    if (listaDinos.length === 0) {
        const response = await fetch('./data/dinosaurios.json');
        const data = await response.json();

        listaDinos = data.map(d => new Dino(
            d.Name,
            d.Diet,
            d.Temperament,
            d.TamingMethod,
            d.Size,
            d.DragWeight,
            d.Maps,
            d.BasicClue,
            d.MediumClue,
            d.StrongClue,
            d.pathDinoModeImg,
            d.pathCreatureModeImg1,
            d.pathCreatureModeImg2,
            d.pathCreatureModeImg3,
            d.pathSaddleModeImg
        ));

        return listaDinos;
    } else {
        return listaDinos;
    }
}

export async function obtenerListaDinos() {
    return structuredClone(await cargarDinos());
}

export function buscarDinosaurios(terminoBusqueda, listaDinosActual) {
    const termino = terminoBusqueda.toLowerCase();
    return listaDinosActual.filter(dino => dino.name.toLowerCase().startsWith(termino));
}