//////////////////////////////////////////////////////////////////////////////////

//Funcion Inicial Al Cargar La Pagina

//////////////////////////////////////////////////////////////////////////////////

////Al iniciar la pagina se oculta el canva, el plano de la casa y los planos que funcionan como la alarma
// Tambien desactiva los bootones del plano, asi dejando solo visible y activo el boton para iniciar la deteccion y con este todo el programa
window.addEventListener("load", function () {
    var main = document.querySelector("main");
    main.style.display = "none";
    datos.imagen.style.display = "none";
    CambiarBotonesMenuPrincipal(2);
    datos.Alarma.Pantallaroja.style.width = '0%';
    datos.Alarma.PantallaAmarilla.style.height = '0%';
});

//////////////////////////////////////////////////////////////////////////////////

//Funcion De La Camara

//////////////////////////////////////////////////////////////////////////////////

var video = null;  // Variable para almacenar el video
var detector = null;  // Variable para almacenar el detector de objetos
var detections = [];  // Variable para almacenar las detecciones
var videoVisibility = true;  // Variable para controlar la visibilidad del video
var detecting = false;  // Variable para controlar el estado de detección

// Obtener los botones de la interfaz de usuario
var detectionAction = document.getElementById('detectionAction');

// Función preload() que se ejecuta antes de setup()
function preload() {
    // Crear un nuevo detector de objetos usando el modelo cocossd
    detector = ml5.objectDetector('cocossd');
}

// Función setup() que se ejecuta una vez antes de draw()
function setup() {
    // Crear el canvas
    createCanvas(448, 336);
    // Obtener el video desde la cámara
    video = createCapture(VIDEO);
    // Redimensionar el video al tamaño del canvas
    video.size(448, 336);
    // Oculta el video en tiempo real de forma que el usuario no vea siempre la camara si no hasta que la active
    video.hide();
}

// Función draw() que se ejecuta en bucle
function draw() {
    // Si no hay video o si la detección no está activada, finalizar la función
    if (!video || !detecting) return;
    // Mostrar el video en el canvas
    image(video, 0, 0);
    // Iterar sobre las detecciones
    for (let i = 0; i < detections.length; i++) {
        // Dibujar los resultados
        drawResult(detections[i]);
    }
}

// Función para dibujar los resultados
function drawResult(object) {
    // Dibujar el recuadro alrededor del objeto
    boundingBox(object);
    // Dibujar la etiqueta del objeto
    drawLabel(object);
}

// Función para dibujar el recuadro alrededor del objeto
function boundingBox(object) {
    // Establecer el color del borde
    stroke('blue');
    // Establecer el grosor del borde
    strokeWeight(5);
    // No dibujar el contenido del recuadro
    noFill();
    // Dibujar el recuadro
    rect(object.x, object.y, object.width - 150, object.height);
}

// Función para dibujar la etiqueta del objeto
function drawLabel(object) {
    // No dibujar el borde
    noStroke();
    // Establecer el color del texto
    fill('white');
    // Establecer el tamaño del texto
    textSize(24);
    // Dibujar la etiqueta del objeto
    text(object.label, object.x + 15, object.y + 34);
}

// Función llamada cuando finaliza la detección
function onDetected(error, results) {
    // Si hay un error, mostrarlo en la consola
    if (error) {
        console.error(error);
    }
    // Asignar los resultados a la variable detections
    detections = results;
    // Si la detección está activada, volver a detectar
    if (detecting) {
        detect();
    }
}

// Función para iniciar la detección
function detect() {
    // Iniciar la detección usando el detector y la función onDetected
    detector.detect(video, onDetected);
}

// Función para controlar la detección
function toggleDetecting() {
    var main = document.querySelector("main");// Variable para manipular el canva
    var Menu = document.getElementById('Menu');// Variable para manipular el menu principal de la aplicacion

    // Cambia el tamaño del menu para luego hacer visible el boton principal para el plano de la casa
    if (BotonPrincipal.classList == 'Ocultar') {
        Menu.style.height = "475px";
        BotonPrincipal.classList.remove('Ocultar');
    }
    // Si no hay video o detector, finalizar la función
    if (!video || !detector) return;
    // Si la detección no está activada
    if (!detecting) {
        // Iniciar la detección
        detect();
        // Si la deteccion se detuvo y se desea reactivar mientras este el plano en la pantalla se lanzara una alerta 
        if (compruebaCondicion(datos)) {
            detectionAction.innerText = 'Parar...';
            Swal.fire({
                title: '¡Camara Oculta!',
                text: 'No se puede mostrar la camara mientras el plano este presente, aunque esta ya esta activa.',
                icon: 'info',
                didOpen: () => {
                    Swal.getPopup().classList.add('Color-swal-container');
                    SwelActivo = true;
                },
                didClose: () => {
                    SwelActivo = false;
                },
            });
        } else if (datos.imagen.style.display == "none") {
            detectionAction.innerText = 'Parar...';
            main.style.display = "flex";
        }
    } else {
        // Si la deteccion esta activada se cambiar el estado de este mismo y detiene la deteccion
        if (compruebaCondicion(datos)) {
            main.style.display = "none";
            detectionAction.innerText = 'Volver a detectar';
        }
    }
    if (SwelActivo == false) {
        // Invertir el estado de detecting
        detecting = !detecting;
    }
}

//////////////////////////////////////
var personDetected = false; //Variable para controlar si una persona fue detectada
var BotonPrincipal = document.getElementById('button'); // Variable para controlar el boton para entrar al plano de la casa
// Función llamada cuando finaliza la detección
function onDetected(error, results) {
    // Si hay un error, mostrarlo en la consola
    if (error) {
        console.error(error);
    }
    // Asignar los resultados a la variable detections
    detections = results;
    // Iterar sobre las detecciones
    for (let i = 0; i < detections.length; i++) {
        // Verificar si alguna detección es una persona
        if (detections[i].label === 'person') {
            // Establecer la variable personDetected a verdadero
            personDetected = true;
            // Habilitar el botón
            BotonPrincipal.disabled = false;
        } else {
            personDetected = false;
            // Deshabilitar el botón
            BotonPrincipal.disabled = true;
        }
    }
    if (personDetected) {
        setTimeout(function () {
            BotonPrincipal.disabled = true;
        }, 1000); // deshabilitar el botón luego de un segundo
    }
    // Si la detección está activada, volver a detectar
    if (detecting) {
        detect();
    }
}

//////////////////////////////////////////////////////////////////////////////////

//Funciones de la camara

//////////////////////////////////////////////////////////////////////////////////

// Funcion para ocultar la camara, mostrar el termostato y el plano de la casa luego de activar el boton deseado 
function detectButtonPress() {
    var main = document.querySelector("main");
    main.style.display = "none";
    var Termostato = document.getElementById("Termostato");
    Termostato.classList.remove('Ocultar');
    if (datos.Contadores.Activador == 0) {
        datos.imagen.style.display = "flex";
        CambiarBotonesMenuPrincipal();
        datos.Contadores.Activador += 1;
    }
}

//////////////////////////////////////////////////////////////////////////////////

//Objetos a utilizar en la casa

//////////////////////////////////////////////////////////////////////////////////

//Guarda todos los botones y varibales a utilizar en el plano en objetos para mejorar su rendimietno y hacerlos mas faciles de manipular 
var datos = {
    imagen: document.getElementById("Imagen1"),
    botones: {
        boton1: document.getElementById("CambiarAPatio"),
        boton2: document.getElementById("CambiarABaño"),
        boton3: document.getElementById("CambiarACocina"),
        boton4: document.getElementById("CambiarAH1"),
        boton5: document.getElementById("CambiarAH2"),
        boton6: document.getElementById("CambiarAH3"),
        BotonConfiguraciones: document.getElementById("Configuraciones")
    },
    Cuartos: {
        botonELP1: document.getElementById("EncenderLuzPatio"),
        botonALP2: document.getElementById("ApagarLuzPatio"),
        botonSP1: document.getElementById("VolverAInicioP"),

        botonELB1: document.getElementById("EncenderLuzBaño"),
        botonALB2: document.getElementById("ApagarLuzBaño"),
        botonVentanaAB1: document.getElementById("AbrirVentanaB"),
        botonVentanaDB2: document.getElementById("CerrarVentanaB"),
        botonSB1: document.getElementById("VolverAInicioB"),

        botonELC1: document.getElementById("EncenderLuzCocina"),
        botonALC2: document.getElementById("ApagarLuzCocina"),
        botonEEC1: document.getElementById("EncenderEstufa"),
        botonAEC2: document.getElementById("ApagarEstufa"),
        botonSC1: document.getElementById("VolverAInicioC"),

        botonELH11: document.getElementById("EncenderLuzH1"),
        botonALH12: document.getElementById("ApagarLuzH1"),
        botonVentanaAH11: document.getElementById("AbrirVentanaH1"),
        botonVentanaDH12: document.getElementById("CerrarVentanaH1"),
        botonSH11: document.getElementById("VolverAInicioH1"),

        botonELH21: document.getElementById("EncenderLuzH2"),
        botonALH22: document.getElementById("ApagarLuzH2"),
        botonVentanaAH21: document.getElementById("AbrirVentanaH2"),
        botonVentanaDH22: document.getElementById("CerrarVentanaH2"),
        botonBEH21: document.getElementById("BañoH2E"),
        botonELBH23: document.getElementById("EncenderLuzBañoH2"),
        botonALBH24: document.getElementById("ApagarLuzBañoH2"),
        botonBSH23: document.getElementById("BañoH2S"),
        botonSH21: document.getElementById("VolverAInicioH2"),

        botonELH31: document.getElementById("EncenderLuzH3"),
        botonALH32: document.getElementById("ApagarLuzH3"),
        botonVentanaAH31: document.getElementById("AbrirVentanaH3"),
        botonVentanaDH32: document.getElementById("CerrarVentanaH3"),
        botonSH31: document.getElementById("VolverAInicioH3")

    },
    Contadores: {
        Activador: 0,
        VentanaA: 0,
        Contador: 0,
        PuertasB: 0,
        LuzD: 0,
        VentanasB: 0
    },
    Alarma: {
        Pantallaroja: document.getElementById("red-overlay"),
        PantallaAmarilla: document.getElementById("yellow-overlay")
    },
    Configuraciones: {
        BotonBP: document.getElementById("BloquearPuertas"),
        BotonDP: document.getElementById("DesbloquearPuertas"),
        BotonDL: document.getElementById("DesactivarLuz"),
        BotonAL: document.getElementById("ActivarLuz"),
        BotonBV: document.getElementById("BloquearVentanas"),
        BotonDV: document.getElementById("DesbloquearVentanas"),
        BotonSConfi: document.getElementById("VolverAInicioConfi")
    }
};

//////////////////////////////////////////////////////////////////////////////////

//Condiciones

//////////////////////////////////////////////////////////////////////////////////

//// Se crean funciones especificas para poder manipular mas facil algunas condiciones que se le pide al programa para cumplir con lo que se desea
//Comprueba que no se lleven acabo procesos si los botones seleccionados estan visibles, si el activador esta desactivado o si hay una alerta activa en la pantalla
function compruebaCondicion(datos) {
    for (key in datos.botones) {
        return ((datos.botones[key].disabled == null || datos.botones[key].disabled == false) && datos.Contadores.Activador == 1 && SwelActivo == false);
    }
}

//Valida si los botones estan visibles y si entre estos se encuentra uno especifico
function ValidarBoton(a1) {
    for (key in datos.Cuartos) {
        if (datos.Cuartos[key].style.display == "flex" && key.endsWith(a1)) {
            return true;
        } else {
        }
    }
    return false;
}

//////////////////////////////////////////////////////////////////////////////////

//Funciones

//////////////////////////////////////////////////////////////////////////////////

//Al entrar en configuraciones hace que los botones de los cuartos se desactiven y solo esten los de configuraciones
function DesactivarBotonesGenerales() {
    for (key in datos.Cuartos) {
        datos.Cuartos[key].disabled = true;
        datos.Cuartos[key].style.display = "none";
    }
    for (key in datos.Configuraciones) {
        datos.Configuraciones[key].disabled = true;
        datos.Configuraciones[key].style.display = "none";
    }
}

////Cambia el estado de los botones principales del plano, los desactiva o los activa dependiendo de lo que se desee
//Para el inicio del programa ayuda a que se desactiven todos los botones que no se van a utilizar
function CambiarBotonesMenuPrincipal(a1 = 0) {
    if(a1 === 2){
        DesactivarBotonesGenerales();
        for (key in datos.botones) {
            datos.botones[key].disabled = true;
            datos.botones[key].style.display = "none";
        }
    }else{
    for (key in datos.botones) {
        if (datos.botones[key].disabled == true) {
            datos.botones[key].disabled = false;
            datos.botones[key].style.display = "flex";
        } else {
            datos.botones[key].disabled = true;
            datos.botones[key].style.display = "none";
        }
    }
    if (a1 !== 0) {
        DesactivarBotonesGenerales();
    }
}
}

//Cambia el estado de los botones de los cuartos, los activa o desactiva dependiendo de que accion ejecuto el usuario (Esta dentro de un cuarto o no)
function CambiarEstadoBotones(a1, a2) {
    for (key1 in datos.Cuartos) {
        if (key1.endsWith(a1)) {
            datos.Cuartos[key1].disabled = true;
            datos.Cuartos[key1].style.display = "none";
        } else if (key1.endsWith(a2)) {
            datos.Cuartos[key1].disabled = false;
            datos.Cuartos[key1].style.display = "flex";
        }
    }
}

//Cambia de forma rapida los botones que estan sujetos a las configuraciones del sistema, asi el usuario sabe que opcion esta activa y cual no 
function CambiarEstadoConfiguraciones(a1, a2) {
    for (key1 in datos.Configuraciones) {
        if (key1.endsWith(a1)) {
            datos.Configuraciones[key1].disabled = true;
            datos.Configuraciones[key1].style.display = "none";
        } else if (key1.endsWith(a2)) {
            datos.Configuraciones[key1].disabled = false;
            datos.Configuraciones[key1].style.display = "flex";
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////

//Comandos Principales

//////////////////////////////////////////////////////////////////////////////////

//Funcion asociada a un posible incendio por lo que puede decir el usuario
artyom.addCommands({
    indexes: ["Fuego", "Incendio"],
    action: function (i) {
        IniciarAlarma();
    }
});

//Funcion necesaria para poder parar la alarma de incendios si ya llegaron los bomberos o si el usuario quiere detener el incendio
artyom.addCommands({
    indexes: ["Parar Alarma", "Bomberos"],
    action: function (i) {
        if (detections.length == 1) {
            PararAlarma += 1;
        }
    }
});

//Funcion de llamado para poder entrar a el patio situado en el plano
artyom.addCommands({
    indexes: ["Entrar Al Patio"],
    action: function (i) {
        console.log();
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.imagen.src = "Imagenes/Patio/PatioLuzApagada.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "P1");
            document.getElementById("AbrirPuerta").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder entrar al baño situado en el plano
artyom.addCommands({
    indexes: ["Entrar Al Baño"],
    action: function (i) {
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.imagen.src = "Imagenes/Baño/BañoLuzApagada.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "B1");
            document.getElementById("AbrirPuerta").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder entrar a la cocina situado en el plano
artyom.addCommands({
    indexes: ["Entrar A La Cocina"],
    action: function (i) {
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.imagen.src = "Imagenes/Cocina/CocinaLuzApagada.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "C1");
            document.getElementById("AbrirPuertaCorrediza").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder entrar a el cuarto numero 1 situado en el plano
artyom.addCommands({
    indexes: ["entrar al Cuarto uno"],
    action: function (i) {
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion1/Habitacion1LuzApagada.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "H11");
            document.getElementById("AbrirPuerta").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder entrar a el cuarto numero 2 situado en el plano
artyom.addCommands({
    indexes: ["entrar al Cuarto dos"],
    action: function (i) {
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.Contadores.Contador *= 0;
            datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBC.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "H21");
            document.getElementById("AbrirPuerta").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder entrar a el cuarto numero 3 situado en el plano
artyom.addCommands({
    indexes: ["entrar al Cuarto tres"],
    action: function (i) {
        if (datos.Contadores.PuertasB == 0 && compruebaCondicion(datos) && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion3/Habitacion3LuzApagada.jpg";
            CambiarBotonesMenuPrincipal();
            CambiarEstadoBotones(0, "H31");
            document.getElementById("AbrirPuerta").play();
        } else if (compruebaCondicion(datos) && detections.length == 1) {
            document.getElementById("PuertaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder salir de algun cuarto en el cual se encuentre el usuario y desee salir de este
artyom.addCommands({
    indexes: ["salir al menú"],
    action: function (i) {
        if (ValidarBoton("BSH23") == false && datos.Configuraciones.BotonSConfi.disabled == true) {
            datos.Contadores.VentanaA *= 0;
            if (ValidarBoton("SC1") && detections.length == 1) {
                document.getElementById("CerrarPuertaCorrediza").play();
            } else if (detections.length == 1) {
                document.getElementById("CerrarPuerta").play();
            }
            datos.imagen.src = "Imagenes/FondoPrincipal.jpg";
            CambiarBotonesMenuPrincipal();
            DesactivarBotonesGenerales();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones Del Patio

//////////////////////////////////////////////////////////////////////////////////

//Funcion de llamado para encender la luz del cuarto en el que se encuentra el usuario
artyom.addCommands({
    indexes: ["Encender Luz Patio"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELP1") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Patio/PatioLuzEncendida.jpg"
            CambiarEstadoBotones("ELP1", "ALP2");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELP1") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

//Funcion de llamado para apagar la luz del cuarto en el que se encuentra el usuario 
artyom.addCommands({
    indexes: ["Apagar Luz Patio"],
    action: function (i) {
        if (ValidarBoton("ALP2") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Patio/PatioLuzApagada.jpg"
            CambiarEstadoBotones("ALP2", "ELP1");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones Del Baño

//////////////////////////////////////////////////////////////////////////////////

artyom.addCommands({
    indexes: ["Encender Luz Baño"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELB1") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Baño/BañoLuzPrendida.jpg"
            CambiarEstadoBotones("ELB1", "ALB2");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELB1") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar Luz Baño"],
    action: function (i) {
        if (ValidarBoton("ALB2") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Baño/BañoLuzApagada.jpg"
            CambiarEstadoBotones("ALB2", "ELB1");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

//Funcion de llamado para poder abrir una ventana del cuarto en el que se encuentra el usuario
artyom.addCommands({
    indexes: ["Abrir Ventana Baño"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("AB1") && detections.length == 1) {
            CambiarEstadoBotones("AB1", "DB2");
            document.getElementById("AbrirUnaVentana").play();
        } else if (ValidarBoton("AB1") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

//Funcion de llamado para poder cerrar una ventana del cuarto en el que se encuentra el usuario
artyom.addCommands({
    indexes: ["Cerrar Ventana Baño"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("DB2") && detections.length == 1) {
            CambiarEstadoBotones("DB2", "AB1");
            document.getElementById("CerrarUnaVentana").play();
        } else if (ValidarBoton("DB2") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones De La Cocina

//////////////////////////////////////////////////////////////////////////////////

artyom.addCommands({
    indexes: ["Encender Luz Cocina"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELC1") && detections.length == 1) {
            if (ValidarBoton("EEC1")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzPrendida.jpg"
            } else {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzPrendidaEstufaPrendida.jpg";
            }
            CambiarEstadoBotones("ELC1", "ALC2");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELC1") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar Luz Cocina"],
    action: function (i) {
        if (ValidarBoton("ALC2") && detections.length == 1) {
            if (ValidarBoton("EEC1")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzApagada.jpg"
            } else {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzApagadaEstufaPrendida.jpg";
            }
            CambiarEstadoBotones("ALC2", "ELC1");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

//Funcion de llamado para poder encender la estufa de la cocina
artyom.addCommands({
    indexes: ["Encender Estufa"],
    action: function (i) {
        if (ValidarBoton("EEC1") && detections.length == 1) {
            if (ValidarBoton("ALC2")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzPrendidaEstufaPrendida.jpg";
            } else if (ValidarBoton("ELC1")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzApagadaEstufaPrendida.jpg";
            }
            CambiarEstadoBotones("EEC1", "AEC2");
            TemperaturaEstufa += 10;
            document.getElementById("EstufaPrendida").play();
            ComprobarTemperatura();
        }
    }
});

//Funcion de llamado para poder apagar la estufa de la cocina
artyom.addCommands({
    indexes: ["Apagar Estufa"],
    action: function (i) {
        if (ValidarBoton("AEC2") && detections.length == 1) {
            if (ValidarBoton("ALC2")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzPrendida.jpg";
            } else if (ValidarBoton("ELC1")) {
                datos.imagen.src = "Imagenes/Cocina/CocinaLuzApagada.jpg";
            }
            CambiarEstadoBotones("AEC2", "EEC1");
            TemperaturaEstufa -= 10;
            document.getElementById("EstufaApagada").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones De La Habitacion1

//////////////////////////////////////////////////////////////////////////////////

artyom.addCommands({
    indexes: ["Encender Luz Cuarto uno"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELH11") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion1/Habitacion1LuzPrendida.jpg"
            CambiarEstadoBotones("ELH11", "ALH12");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELH11") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar Luz Cuarto uno"],
    action: function (i) {
        if (ValidarBoton("ALH12") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion1/Habitacion1LuzApagada.jpg"
            CambiarEstadoBotones("ALH12", "ELH11");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Abrir Ventana Cuarto uno"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("AH11") && detections.length == 1) {
            CambiarEstadoBotones("AH11", "DH12");
            datos.Contadores.VentanaA += 1;
            document.getElementById("AbrirUnaVentana").play();
        } else if (ValidarBoton("AH11") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Cerrar Ventana Cuarto uno"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("DH12") && detections.length == 1) {
            CambiarEstadoBotones("DH12", "AH11");
            datos.Contadores.VentanaA *= 0;
            document.getElementById("CerrarUnaVentana").play();
        } else if (ValidarBoton("DH12") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones De La Habitacion2

//////////////////////////////////////////////////////////////////////////////////

artyom.addCommands({
    indexes: ["Encender Luz Cuarto dos"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELH21") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzPrendidaBC.jpg"
            CambiarEstadoBotones("ELH21", "ALH22");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELH21") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar Luz Cuarto dos"],
    action: function (i) {
        if (ValidarBoton("ELH21") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBC.jpg"
            CambiarEstadoBotones("ALH22", "ELH21");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});


artyom.addCommands({
    indexes: ["Abrir Ventana Cuarto dos"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("AH21") && detections.length == 1) {
            CambiarEstadoBotones("AH21", "DH22");
            datos.Contadores.VentanaA += 1;
            document.getElementById("AbrirUnaVentana").play();
        } else if (ValidarBoton("AH21") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Cerrar Ventana Cuarto dos"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("DH22") && detections.length == 1) {
            CambiarEstadoBotones("DH22", "AH21");
            datos.Contadores.VentanaA *= 0;
            document.getElementById("CerrarUnaVentana").play();
        } else if (ValidarBoton("DH22") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

//Esta funcion de llamado permite al usuario entrar al cuarto de baño
artyom.addCommands({
    indexes: ["Entrar Al Cuarto De Baño"],
    action: function (i) {
        if (ValidarBoton("BEH21") && detections.length == 1) {
            if (ValidarBoton("ELH21")) {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBALuzApagada.jpg"
                datos.Contadores.Contador += 1;
            } else if (ValidarBoton("ALH22")) {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzPrendidaBALuzApagada.jpg"
                datos.Contadores.Contador *= 0;
            }
            var Boton = [
                ["BEH21", "BSH23"], ["SH21", "ELBH23"], ["AH21", 0], ["ELH21", 0], ["DH22", 0], ["ALH22", 0]
            ];

            Boton.forEach(function (dato) {
                CambiarEstadoBotones(dato[0], dato[1]);
            });
            document.getElementById("AbrirPuerta").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Encender luz del Cuarto De Baño"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELBH23") && detections.length == 1) {
            if (datos.Contadores.Contador == 1) {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBALuzPrendida.jpg"
            } else {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzPrendidaBALuzPrendida.jpg"
            }
            CambiarEstadoBotones("ELBH23", "ALBH24");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELBH23") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar luz del Cuarto De Baño"],
    action: function (i) {
        if (ValidarBoton("ALBH24") && detections.length == 1) {
            if (datos.Contadores.Contador == 1) {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBALuzApagada.jpg"
            } else {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzPrendidaBALuzApagada.jpg"
            }
            CambiarEstadoBotones("ALBH24", "ELBH23");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELBH23") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

//Esta funcion de llamado permite al usuario salir del cuarto de baño
artyom.addCommands({
    indexes: ["Salir del Cuarto De Baño"],
    action: function (i) {
        if (ValidarBoton("BSH23") && detections.length == 1) {
            if (datos.Contadores.Contador == 1) {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzApagadaBC.jpg"
                CambiarEstadoBotones(0, "ELH21");
            } else {
                datos.imagen.src = "Imagenes/Habitacion2/Habitacion2LuzPrendidaBC.jpg"
                CambiarEstadoBotones(0, "ALH22");
            }
            if (datos.Contadores.VentanaA == 1) {
                CambiarEstadoBotones("BSH23", "DH22");
            } else {
                CambiarEstadoBotones("BSH23", "AH21");
            }

            var Boton = [
                ["ELBH23", "SH21"], ["ALBH24", "BEH21"]
            ];

            Boton.forEach(function (dato) {
                CambiarEstadoBotones(dato[0], dato[1]);
            });
            document.getElementById("CerrarPuerta").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Botones De La Habitacion3

//////////////////////////////////////////////////////////////////////////////////

artyom.addCommands({
    indexes: ["Encender Luz Cuarto tres"],
    action: function (i) {
        if (datos.Contadores.LuzD == 0 && ValidarBoton("ELH31") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion3/Habitacion3LuzPrendida.jpg"
            CambiarEstadoBotones("ELH31", "ALH32");
            document.getElementById("InterruptorDeLuz").play();
        } else if (ValidarBoton("ELH31") && detections.length == 1) {
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Apagar Luz Cuarto tres"],
    action: function (i) {
        if (ValidarBoton("ELH32") && detections.length == 1) {
            datos.imagen.src = "Imagenes/Habitacion3/Habitacion3LuzApagada.jpg"
            CambiarEstadoBotones("ALH32", "ELH31");
            document.getElementById("InterruptorDeLuz").play();
        }
    }
});


artyom.addCommands({
    indexes: ["Abrir Ventana Cuarto tres"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("AH31") && detections.length == 1) {
            CambiarEstadoBotones("AH31", "DH32");
            datos.Contadores.VentanaA += 1;
            document.getElementById("AbrirUnaVentana").play();
        } else if (ValidarBoton("AH31") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

artyom.addCommands({
    indexes: ["Cerrar Ventana Cuarto tres"],
    action: function (i) {
        if (datos.Contadores.VentanasB == 0 && ValidarBoton("DH32") && detections.length == 1) {
            CambiarEstadoBotones("DH32", "AH31");
            datos.Contadores.VentanaA *= 0;
            document.getElementById("CerrarUnaVentana").play();
        } else if (ValidarBoton("DH32") && detections.length == 1) {
            document.getElementById("VentanaBloqueada").play();
        }
    }
});

//////////////////////////////////////////////////////////////////////////////////

//Configuraciones

//////////////////////////////////////////////////////////////////////////////////

////Esta funcion muestra el menu de configuraciones
//Dependiendo de las configuraciones que se activen a lo largo del programa se mostrara la contraparte de esta en los botones para asi dar la opcion de desactivarla
artyom.addCommands({
    indexes: ["Configuraciones"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarBotonesMenuPrincipal();
            if (datos.Contadores.PuertasB == 1 && datos.Contadores.Activador == 1) {
                CambiarEstadoConfiguraciones("BP", "DP");
            } else {
                CambiarEstadoConfiguraciones("DP", "BP");
            }
            if (datos.Contadores.LuzD == 1) {
                CambiarEstadoConfiguraciones("DL", "AL");
            } else {
                CambiarEstadoConfiguraciones("AL", "DL");
            }
            if (datos.Contadores.VentanasB == 1) {
                CambiarEstadoConfiguraciones("BV", "DV");
            } else {
                CambiarEstadoConfiguraciones("DV", "BV");
            }
            CambiarEstadoConfiguraciones(0, "SConfi");
        }
    }
});

//Bloquea las puertas del plano, asi impidiendo la entrada a los cuartos
artyom.addCommands({
    indexes: ["Bloquear Puertas"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("BP", "DP");
            datos.Contadores.PuertasB += 1;
        }
    }
});

//Desbloquea las puertas del plano, asi permitiendo la entrada a los cuartos
artyom.addCommands({
    indexes: ["Desbloquear Puertas"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("DP", "BP", 0);
            datos.Contadores.PuertasB *= 0;
        }
    }
});

//Corta la luz del plano haciendo que no se puedan encender las luces en las distintas habitaciones 
artyom.addCommands({
    indexes: ["Desactivar Luz"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("DL", "AL");
            datos.Contadores.LuzD += 1;
        }
    }
});

//Reactiva la luz del plano, permitiendo asi que se pueda encender la luz en cualquier habitacion 
artyom.addCommands({
    indexes: ["Activar Luz"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("Al", "DL");
            datos.Contadores.LuzD *= 0;
        }
    }
});

//Bloquea las ventanas en el plano, impidiendo asi que se puedan abrir
artyom.addCommands({
    indexes: ["Bloquear Ventanas"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("BV", "DV");
            datos.Contadores.VentanasB += 1;
        }
    }
});

//Desbloquea las ventanas en el plano, permitiendo asi que se puedan abrir
artyom.addCommands({
    indexes: ["Desbloquear Ventanas"],
    action: function (i) {
        if (detections.length == 1) {
            CambiarEstadoConfiguraciones("DV", "BV");
            datos.Contadores.VentanasB *= 0;
        }
    }
});

//Sale de las configuraciones y le muestra de nuevo el menu principal del plano al usuario
artyom.addCommands({
    indexes: ["Salir De Configuraciones"],
    action: function (i) {
        if (datos.Configuraciones.BotonSConfi.disabled == false && detections.length == 1) {
            CambiarBotonesMenuPrincipal(1);
            datos.imagen.src = "Imagenes/FondoPrincipal.jpg";
        }
    }
});


//////////////////////////////////////////////////////////////////////////////////

//Funciones de la alarma

//////////////////////////////////////////////////////////////////////////////////

var duracionImagen = 1000;// Variable para controlar el tiempo que se muestran cada una de las imagenes al iniciar la alarma
var PararAlarma = 0;// Variable para que el usuario detenga la ejecucion de la alarma siempre que quiera
var AlarmaActivada = 1;// Variable que controla el estado de la alarma (Activa/Detenida)

//Inicia un llamado para activar toda la funcionalidad de la alarma
function IniciarAlarma() {
    AlarmaActivada *= 0;
    PararAlarma *= 0;
    Alarma(datos.Alarma.Pantallaroja, datos.Alarma.PantallaAmarilla);
};

//Controla la funcionalidad de la alarma, definiendo asi su duracion, las imagenes que se van a utilizar para esta y cuando se va a detener
function Alarma(a1, a2) {

    let imagenes = [
        a1,
        a2
    ];
    let Containt = 0

    for (var i = 0; i < imagenes.length + 9; i += 1) {
        if (PararAlarma == 1) {
            PararAlarma *= 0;
            AlarmaActivada += 1;
            a1.style.zIndex = -1;
            a1.style.height = '0px';
            a2.style.zIndex = -1;
            a2.style.height = '0px';
            document.getElementById("AlarmaIncendios").pause();
            break;
        }
        setTimeout(function () {
            if (AlarmaActivada == 0) {
                document.getElementById("AlarmaIncendios").play();
                var Variabletop = datos.imagen.y - '5';

                datos.Alarma.Pantallaroja.style.top = (Variabletop) + 'px';
                datos.Alarma.Pantallaroja.style.width = datos.imagen.width + 'px';
                datos.Alarma.Pantallaroja.style.height = datos.imagen.height + 'px';

                datos.Alarma.PantallaAmarilla.style.top = (Variabletop) + 'px';
                datos.Alarma.PantallaAmarilla.style.width = datos.imagen.width + 'px';
                datos.Alarma.PantallaAmarilla.style.height = datos.imagen.height + 'px';

                if (Containt % (i - 9) == 0) {
                    a1.style.zIndex = 2;
                    a1.style.backgroundColor = "rgba(248, 64, 64, 0.378)";
                    a2.style.zIndex = -1;
                    a2.style.backgroundColor = "transparent";
                } else {
                    a2.style.zIndex = 2;
                    a2.style.backgroundColor = "rgba(251, 251, 58, 0.273)";
                    a1.style.zIndex = -1;
                    a1.style.backgroundColor = "transparent";
                }
                Containt += 1;
                if (Containt == 10) {
                    Alarma(datos.Alarma.Pantallaroja, datos.Alarma.PantallaAmarilla);
                    Containt *= 0;
                }
            }
        }, i * duracionImagen);
    }
};

//////////////////////////////////////////////////////////////////////////////////

//Termostato

//////////////////////////////////////////////////////////////////////////////////

var TemperaturaDisplay = document.getElementById("Temperatura");// Variable para manipular la temperatura que se va a mostrar en el termostato
var SwelActivo = false;// Variable para identifficar si hay un swelalert activo en la pantalla
var SwelMaximo = true;// Variable para identificar un swelalert como el que debe aparecer con la temperatura maxima alcanzada
var SwelMinimo = true;// Variable para identificar un swelalert como el que debe aparecer con la temperatura minima alcanzada
var Temperatura = 20;// Variable para controlar la temperatura del termostato 
var TemperaturaEstufa = 0;// Variable que controla la temperatura que genera la estufa en la casa
var TemperaturaGeneral;// Variable que se encargara de reunir la temperatura general que hay en la casa

//////Funcion encargada de aumentar la teperatura del termostato
////En esta se aumenta la temperatura que va a registrar la casa como temperatura general y tambien se aumenta la temperatura mostrada por el termostato al usuario 
//Si se llega a la temperatura maxima recomendada se muestra un swelalert (esta temperatura se ajusta segun lo desee el usuario)
function AumentarTemperatura() {

    if (AlarmaActivada == 0 && detections.length == 1) {
        Swal.fire({
            title: '¡La Alarma Esta Activa!',
            text: 'Debido a un posible incendio no se pueden realizar algunas acciones hasta que se solucione.',
            icon: 'warning',
            didOpen: () => {
                Swal.getPopup().classList.add('Color-swal-container');
                SwelActivo = true;
            },
            didClose: () => {
                SwelActivo = false;
            },
        });
    } else {
        if (Temperatura == 31 && SwelActivo == false && SwelMaximo == true && detections.length == 1) {
            swal.fire({
                title: '¡Temperatura Muy Alta!',
                text: 'El termostato ha alcanzado la temperatura maxima recomendada.',
                icon: 'warning',
                toast: true,
                didOpen: () => {
                    Swal.getPopup().classList.add('Color-swal-container');
                },
                willOpen: () => {
                    SwelActivo = true;
                    SwelMaximo = false;
                    Temperatura++;
                },
                didClose: () => {
                    SwelActivo = false;
                },
            });
        } else if (SwelActivo == false) {
            Temperatura++;
        }
        ActualizarTemperatura();
    }
    //llama a una funcion para comprobar un posible incendio por la temperatura de la casa
    ComprobarTemperatura()
}

//////Funcion encargada de disminuir la teperatura del termostato
////En esta se disminuye la temperatura que va a registrar la casa como temperatura general y tambien disminuye la temperatura mostrada por el termostato al usuario 
//Si se llega a la temperatura minima recomendada se muestra un swelalert (esta temperatura se ajusta segun lo desee el usuario)
function DisminuirTemperatura() {
    if (AlarmaActivada == 0 && detections.length == 1) {
        Swal.fire({
            title: '¡La Alarma Esta Activa!',
            text: 'Debido a un posible incendio no se pueden realizar algunas acciones hasta que se solucione.',
            icon: 'warning',
            didOpen: () => {
                Swal.getPopup().classList.add('Color-swal-container');
                SwelActivo = true;
            },
            didClose: () => {
                SwelActivo = false;
            },
        });
    } else {
        if (Temperatura == 11 && SwelActivo == false && SwelMinimo == true && detections.length == 1) {
            swal.fire({
                title: '¡Temperatura Muy Baja!',
                text: 'El termostato ha alcanzado la temperatura minima recomendada.',
                icon: 'warning',
                toast: true,
                didOpen: () => {
                    Swal.getPopup().classList.add('Color-swal-container');
                },
                willOpen: () => {
                    SwelActivo = true;
                    SwelMinimo = false;
                    Temperatura--;
                },
                didClose: () => {
                    SwelActivo = false;
                },
            });
        } else if (SwelActivo == false) {
            Temperatura--;
        }
        TemperaturaGeneral = Temperatura + TemperaturaEstufa;
        ActualizarTemperatura();
    }
}

//Funcion encargada de sumar o resta la temperatura de la casa
function ActualizarTemperatura() {
    TemperaturaDisplay.textContent = Temperatura;
}

//Funcion encargada de comprobar la temperatura general de la casa por si se llega a presentar un problema 
function ComprobarTemperatura() {
    //Se suman los distintos factores que alteran la temperatura en la casa
    TemperaturaGeneral = Temperatura + TemperaturaEstufa;
    // Deteccion por posible incendio
    if (TemperaturaGeneral >= 45) {
        TemperaturaGeneral *= 0;
        IniciarAlarma();
    };
}