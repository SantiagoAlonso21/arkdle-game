import { renderizarVista } from './nucleo/Router.js';

// Detecto cuando se cargo el DOM
document.addEventListener('DOMContentLoaded', function() {
    let modos =document.querySelectorAll(".modo");

    modos.forEach(modo => {
        modo.addEventListener("click", function() {
            location.hash = this.getAttribute("data-route");
        });
    });

    // Navegabilidad
    document.getElementById("btnVolverHome").addEventListener("click", function() {
        location.hash = '/';
    });

    // Renderizar la vista inicial basada en el hash actual
    const hashActual = window.location.hash.slice(1) || '/';
    renderizarVista(hashActual);
});

// Manejo la modificacion del hash en la URL
window.addEventListener('hashchange', function() {
    renderizarVista(window.location.hash.slice(1) || '/');
});