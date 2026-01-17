import { iniciarModoCriatura } from "../ui/ModoCriaturaUI.js";
import { iniciarModoDino } from "../ui/ModoDinoUI.js";
import { iniciarModoMapa } from "../ui/ModoMapaUI.js";
import { iniciarModoMontura } from "../ui/ModoMonturaUI.js";

export function renderizarVista(vista) {
    ocultarTodasLasVistas();
    switch (vista) {
        case '/modoDinosaurio':
            iniciarModoDino();
            break;
        case '/modoCriatura':
            iniciarModoCriatura();
            break;
        case "/modoMapa":
            iniciarModoMapa();
            break;
        case "/modoMontura":
            iniciarModoMontura();
            break;
        case "/":
        default:
            document.getElementById("vistaHome").style.display = "flex";
            location.hash = '/';
            break;
    }
}

function ocultarTodasLasVistas() {
    document.getElementById("vistaHome").style.display = "none";
    document.getElementById("vistaModoDino").style.display = "none";
    document.getElementById("vistaModoMapa").style.display = "none";
    document.getElementById("vistaModoCriatura").style.display = "none";
    document.getElementById("vistaModoMontura").style.display = "none";
    document.getElementById("headerModos").style.display = "none";
    
    // Cerrar todos los modales al cambiar de vista
    cerrarTodosLosModales();
}

function cerrarTodosLosModales() {
    const modales = document.querySelectorAll('[id^="modalSettings"], [id^="modalPistas"]');
    modales.forEach(modal => {
        modal.style.display = 'none';
    });
}