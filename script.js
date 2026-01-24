/************ CONFIGURACIÓN ************/
let totalTime = 120 * 60;
let timerInterval = null;

/************ VARIABLES ************/
let preguntas = [];
let lecturas = [];

let lecturasSeleccionadas = [];
let lecturaActual = 0;
let preguntasLecturaActual = [];
let preguntaLecturaIndex = 0;

let respuestasUsuario = [];

let razonamientoSeleccionado = [];
let razonamientoIndex = 0;

let conocimientosSeleccionados = [];
let conocimientosIndex = 0;

let socioemocionalesSeleccionadas = [];
let socioIndex = 0;

let isPremium = false;
const correosPremium = [
    "yerzinsinka7@gmail.com",
    "admin@examen.com",
    "anethycasal@gmail.com",
    "aydeemamani",
    "Chelito10",
    "15212024"
];

const contactoDonaciones = {
    yapeQR: "https://i.ibb.co/mF99V38X/Whats-App-Image-2026-01-09-at-2-06-26-PM.jpg",
    celular: "59177247092",
    montoPremium: 15,
    correoContacto: "yerzinsinka7@gmail.com"
};

/************ ELEMENTOS HTML ************/
const startBtn = document.getElementById("startBtn");
const timer = document.getElementById("timer");
const examContainer = document.getElementById("examContainer");

/************ CARGAR DATOS ************/
fetch("preguntas.json")
    .then(res => res.json())
    .then(data => {
        preguntas = data;
        console.log("Preguntas cargadas:", preguntas.length);
        if (lecturas.length > 0) {
            startBtn.disabled = false;
        }
    })
    .catch(err => console.error("Error cargando preguntas:", err));

async function cargarLecturas() {
    try {
        const response = await fetch("lecturas.json");
        lecturas = await response.json();
        console.log("Lecturas cargadas:", lecturas.length);
        if (preguntas.length > 0) {
            startBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error cargando lecturas:", error);
    }
}
cargarLecturas();

/************ FUNCIONES DE UTILIDAD ************/
function mezclarPreguntas(arrayPreguntas, cantidad) {
    if (arrayPreguntas.length === 0) return [];
    const mezcladas = [...arrayPreguntas];
    for (let i = mezcladas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
    }
    return mezcladas.slice(0, Math.min(cantidad, mezcladas.length));
}

function mezclarPreguntasYopciones(preguntasArray) {
    const preguntasMezcladas = [...preguntasArray].sort(() => Math.random() - 0.5);
    return preguntasMezcladas.map(pregunta => {
        let opciones = pregunta.opciones.map((op, i) => ({
            texto: op,
            correcta: i === pregunta.correcta
        }));
        opciones = opciones.sort(() => Math.random() - 0.5);
        return {
            ...pregunta,
            opciones: opciones.map(op => op.texto),
            correcta: opciones.findIndex(op => op.correcta)
        };
    });
}

function contarPreguntasPorCriterio(criterio) {
    return preguntas.filter(p => {
        for (let key in criterio) {
            if (p[key] !== criterio[key]) return false;
        }
        return true;
    }).length;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function obtenerNombreSubtipo(subtipo) {
    const nombres = {
        'patrones': 'Patrones',
        'logicamatematica': 'Lógico Matemático',
        'resolucionproblemas': 'Resolución de Problemas'
    };
    return nombres[subtipo] || subtipo;
}

/************ MENÚ PRINCIPAL ************/
function mostrarMenuPrincipal() {
    document.getElementById("mainMenu").style.display = "block";
    examContainer.style.display = "none";
    startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar Examen Completo';
    startBtn.disabled = false;
}

function volverAlMenu() {
    clearInterval(timerInterval);
    timerInterval = null;
    timer.textContent = "Tiempo: 120:00";
    timer.style.color = "white";
    timer.style.animation = "none";
    mostrarMenuPrincipal();
}

/************ EXAMEN COMPLETO ************/
startBtn.addEventListener("click", cargarExamenCompleto);

function cargarExamenCompleto() {
    if (lecturas.length === 0 || preguntas.length === 0) {
        alert("Esperando a que carguen las preguntas y lecturas. Por favor, intenta de nuevo.");
        return;
    }

    document.getElementById("mainMenu").style.display = "none";
    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Examen iniciado';
    examContainer.style.display = "block";

    lecturasSeleccionadas = [];
    lecturaActual = 0;
    preguntasLecturaActual = [];
    preguntaLecturaIndex = 0;
    respuestasUsuario = [];
    razonamientoSeleccionado = [];
    razonamientoIndex = 0;
    conocimientosSeleccionados = [];
    conocimientosIndex = 0;
    socioemocionalesSeleccionadas = [];
    socioIndex = 0;
    isPremium = false;

    seleccionarLecturasAleatorias();
    mostrarLectura(lecturasSeleccionadas[0]);
    timerInterval = setInterval(actualizarTimer, 1000);
}

function actualizarTimer() {
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime % 60;
    timer.textContent = `Tiempo: ${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (totalTime <= 0) {
        clearInterval(timerInterval);
        timer.textContent = "Tiempo terminado";
        finishExam();
    }
    totalTime--;
}

function seleccionarLecturasAleatorias() {
    const copiaLecturas = [...lecturas];
    for (let i = copiaLecturas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiaLecturas[i], copiaLecturas[j]] = [copiaLecturas[j], copiaLecturas[i]];
    }
    lecturasSeleccionadas = copiaLecturas.slice(0, 3);
}

function mostrarLectura(lectura) {
    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Lectura ${lecturaActual + 1} de 3</span>
                <span>${Math.round((lecturaActual / 3) * 100)}% completado</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(lecturaActual / 3) * 100}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-book-open"></i> ${lectura.titulo}</h2>
        <div class="lecture-content">${lectura.texto}</div>
        <button onclick="comenzarPreguntasLectura()" class="start-btn">
            <i class="fas fa-forward"></i> Comenzar preguntas de esta lectura
        </button>
    `;
}

function obtenerPreguntasDeLectura(idLectura) {
    const preguntasFiltradas = preguntas.filter(p => p.subcategoria === idLectura);
    if (preguntasFiltradas.length === 0) return [];
    const preguntasMezcladas = [...preguntasFiltradas];
    for (let i = preguntasMezcladas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [preguntasMezcladas[i], preguntasMezcladas[j]] = [preguntasMezcladas[j], preguntasMezcladas[i]];
    }
    return preguntasMezcladas.slice(0, Math.min(12, preguntasMezcladas.length));
}

function comenzarPreguntasLectura() {
    if (!lecturasSeleccionadas[lecturaActual]) return;
    preguntasLecturaActual = obtenerPreguntasDeLectura(lecturasSeleccionadas[lecturaActual].id);
    if (preguntasLecturaActual.length === 0) {
        alert(`No hay preguntas disponibles para esta lectura. Pasando a la siguiente...`);
        siguienteLectura();
        return;
    }
    preguntaLecturaIndex = 0;
    mostrarPreguntaLectura();
}

function mostrarPreguntaLectura() {
    if (preguntaLecturaIndex >= preguntasLecturaActual.length) {
        siguienteLectura();
        return;
    }

    const q = preguntasLecturaActual[preguntaLecturaIndex];
    const preguntasPorLectura = 12;
    const preguntasTotales = 3 * preguntasPorLectura;
    const progreso = ((lecturaActual * preguntasPorLectura + preguntaLecturaIndex + 1) / preguntasTotales) * 100;

    let opciones = q.opciones.map((op, i) => ({
        texto: op,
        correcta: i === q.correcta,
        indiceOriginal: i
    }));
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${preguntaLecturaIndex + 1} de ${preguntasLecturaActual.length} (Lectura ${lecturaActual + 1})</span>
                <span>${Math.round(progreso)}% del examen</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h3><i class="fas fa-file-alt"></i> Comprensión de Lectura</h3>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${opciones.map((op, i) => `
                <div class="option-card" 
                     onclick="responderLectura(${i}, ${JSON.stringify(opciones).replace(/"/g, '&quot;')}, '${q.categoria}', '${q.subcategoria}', ${q.id || 'null'})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op.texto}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderLectura(indexSeleccionado, opciones, categoria, subcategoria, preguntaId) {
    const preguntaActual = preguntasLecturaActual[preguntaLecturaIndex];
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria,
        preguntaId,
        preguntaTexto: preguntaActual.pregunta,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });
    preguntaLecturaIndex++;
    mostrarPreguntaLectura();
}

function siguienteLectura() {
    lecturaActual++;
    if (lecturaActual < lecturasSeleccionadas.length) {
        mostrarLectura(lecturasSeleccionadas[lecturaActual]);
    } else {
        seleccionarRazonamientoAleatorio();
        mostrarPreguntaRazonamiento();
    }
}

function seleccionarRazonamientoAleatorio() {
    const patrones = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "patrones"), 12);
    const logica = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "logicamatematica"), 12);
    const resolucion = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "resolucionproblemas"), 13);
    razonamientoSeleccionado = [...patrones, ...logica, ...resolucion];
    for (let i = razonamientoSeleccionado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [razonamientoSeleccionado[i], razonamientoSeleccionado[j]] = [razonamientoSeleccionado[j], razonamientoSeleccionado[i]];
    }
    razonamientoIndex = 0;
}

function mostrarPreguntaRazonamiento() {
    if (razonamientoIndex >= razonamientoSeleccionado.length) {
        seleccionarConocimientosAleatorios();
        mostrarPreguntaConocimientos();
        return;
    }

    const q = razonamientoSeleccionado[razonamientoIndex];
    const preguntasRazonamiento = 37;
    const preguntasTotales = 100;
    const progreso = ((36 + razonamientoIndex + 1) / preguntasTotales) * 100;

    let opciones = q.opciones.map((op, i) => ({
        texto: op,
        correcta: i === q.correcta,
        indiceOriginal: i
    }));
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${36 + razonamientoIndex + 1} de ${preguntasTotales}</span>
                <span>${Math.round(progreso)}% del examen</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-brain"></i> Razonamiento Lógico - ${q.subcategoria}</h2>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${opciones.map((op, i) => `
                <div class="option-card" onclick="responderRazonamiento(${i}, ${JSON.stringify(opciones).replace(/"/g,'&quot;')}, '${q.categoria}', '${q.subcategoria}', ${q.id || 'null'})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op.texto}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderRazonamiento(indexSeleccionado, opciones, categoria, subcategoria, preguntaId) {
    const preguntaActual = razonamientoSeleccionado[razonamientoIndex];
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria,
        preguntaId,
        preguntaTexto: preguntaActual.pregunta,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });
    razonamientoIndex++;
    mostrarPreguntaRazonamiento();
}

function seleccionarConocimientosAleatorios() {
    const materias = ["fisica", "matematica", "quimica", "lenguaje", "historia", 
                     "geografia", "psicologia", "filosofia", "biologia", "tecnologia"];
    const conteo = [3, 3, 3, 3, 3, 2, 2, 2, 2, 2];
    conocimientosSeleccionados = [];
    materias.forEach((materia, index) => {
        const preguntasMateria = preguntas.filter(p =>
            p.categoria === "Conocimientos Generales" && p.materia === materia
        );
        conocimientosSeleccionados.push(...mezclarPreguntas(preguntasMateria, conteo[index]));
    });
    for (let i = conocimientosSeleccionados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [conocimientosSeleccionados[i], conocimientosSeleccionados[j]] = [conocimientosSeleccionados[j], conocimientosSeleccionados[i]];
    }
    conocimientosIndex = 0;
}

function mostrarPreguntaConocimientos() {
    if (conocimientosIndex >= conocimientosSeleccionados.length) {
        seleccionarSocioemocionalesAleatorias();
        mostrarPreguntaSocioemocional();
        return;
    }

    const q = conocimientosSeleccionados[conocimientosIndex];
    const preguntasConocimientos = 25;
    const preguntasTotales = 100;
    const progreso = ((73 + conocimientosIndex + 1) / preguntasTotales) * 100;

    let opciones = q.opciones.map((op, i) => ({
        texto: op,
        correcta: i === q.correcta,
        indiceOriginal: i
    }));
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${73 + conocimientosIndex + 1} de ${preguntasTotales}</span>
                <span>${Math.round(progreso)}% del examen</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-book"></i> Conocimientos Generales - ${q.materia}</h2>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${opciones.map((op, i) => `
                <div class="option-card" onclick="responderConocimientos(${i}, ${JSON.stringify(opciones).replace(/"/g,'&quot;')}, '${q.categoria}', '${q.materia}', ${q.id || 'null'})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op.texto}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderConocimientos(indexSeleccionado, opciones, categoria, materia, preguntaId) {
    const preguntaActual = conocimientosSeleccionados[conocimientosIndex];
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria: materia,
        preguntaId,
        preguntaTexto: preguntaActual.pregunta,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });
    conocimientosIndex++;
    mostrarPreguntaConocimientos();
}

function seleccionarSocioemocionalesAleatorias() {
    const preguntasSocio = preguntas.filter(p =>
        p.categoria.toLowerCase() === "habilidades socioemocionales"
    );
    socioemocionalesSeleccionadas = mezclarPreguntas(preguntasSocio, 2);
    socioIndex = 0;
}

function mostrarPreguntaSocioemocional() {
    if (socioIndex >= socioemocionalesSeleccionadas.length) {
        finishExam();
        return;
    }

    const q = socioemocionalesSeleccionadas[socioIndex];
    const preguntasTotales = 100;
    const progreso = ((98 + socioIndex + 1) / preguntasTotales) * 100;

    let opciones = q.opciones.map((op, i) => ({
        texto: op,
        correcta: i === q.correcta,
        indiceOriginal: i
    }));
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${98 + socioIndex + 1} de ${preguntasTotales}</span>
                <span>${Math.round(progreso)}% del examen</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-heart"></i> Habilidades Socioemocionales</h2>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${opciones.map((op, i) => `
                <div class="option-card"
                     onclick="responderSocioemocional(${i}, ${JSON.stringify(opciones).replace(/"/g,'&quot;')}, ${JSON.stringify(q).replace(/"/g,'&quot;')})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op.texto}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderSocioemocional(indexSeleccionado, opciones, preguntaCompleta) {
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria: "Habilidades Socioemocionales",
        subcategoria: preguntaCompleta.subcategoria || "",
        preguntaId: preguntaCompleta.id || null,
        preguntaTexto: preguntaCompleta.pregunta,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });
    socioIndex++;
    if (socioIndex >= socioemocionalesSeleccionadas.length) {
        finishExam();
    } else {
        mostrarPreguntaSocioemocional();
    }
}

/************ MÓDULOS INDIVIDUALES ************/
function mostrarMenuLecturas() {
    const lecturasConConteo = lecturas.map(lectura => {
        const preguntasLectura = preguntas.filter(p => p.subcategoria === lectura.id);
        return {
            ...lectura,
            numPreguntas: preguntasLectura.length
        };
    });
    
    examContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2><i class="fas fa-book-open"></i> Comprensión Lectora</h2>
            <p>Elige una lectura para practicar todas sus preguntas</p>
            <div style="max-width: 600px; margin: 30px auto;">
                ${lecturasConConteo.map((lectura, index) => `
                    <div style="background: white; border-radius: 10px; padding: 20px; margin: 15px 0; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                        <h3 style="margin-top: 0;">${lectura.titulo}</h3>
                        <p style="color: #666; font-size: 0.9rem;">Contiene ${lectura.numPreguntas} preguntas</p>
                        <button onclick="iniciarLecturaIndividual('${lectura.id}')" class="start-btn" style="margin-top: 10px;">
                            <i class="fas fa-play"></i> Practicar esta lectura (${lectura.numPreguntas} preguntas)
                        </button>
                    </div>
                `).join('')}
            </div>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666;">
                <i class="fas fa-arrow-left"></i> Volver al menú
            </button>
        </div>
    `;
    examContainer.style.display = "block";
    document.getElementById("mainMenu").style.display = "none";
}

function iniciarLecturaIndividual(idLectura) {
    respuestasUsuario = [];
    isPremium = false;
    const lecturaSeleccionada = lecturas.find(l => l.id === idLectura);
    if (!lecturaSeleccionada) {
        alert("Lectura no encontrada");
        volverAlMenu();
        return;
    }
    const preguntasLectura = preguntas.filter(p => p.subcategoria === idLectura);
    console.log(`Cargando ${preguntasLectura.length} preguntas para lectura ${idLectura}`);
    preguntasLecturaActual = mezclarPreguntasYopciones(preguntasLectura);
    examContainer.innerHTML = `
        <div style="text-align: center;">
            <h2><i class="fas fa-book-open"></i> ${lecturaSeleccionada.titulo}</h2>
            <p><strong>${preguntasLecturaActual.length} preguntas disponibles</strong></p>
            <div class="lecture-content" style="text-align: left; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; max-height: 500px; overflow-y: auto;">
                ${lecturaSeleccionada.texto}
            </div>
            <button onclick="comenzarPreguntasLecturaIndividual()" class="start-btn">
                <i class="fas fa-forward"></i> Comenzar las ${preguntasLecturaActual.length} preguntas
            </button>
        </div>
    `;
}

function comenzarPreguntasLecturaIndividual() {
    preguntaLecturaIndex = 0;
    mostrarPreguntaLecturaIndividual();
}

function mostrarPreguntaLecturaIndividual() {
    if (!preguntasLecturaActual || preguntasLecturaActual.length === 0) {
        examContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3><i class="fas fa-exclamation-triangle"></i> No hay preguntas disponibles</h3>
                <p>Esta lectura no tiene preguntas asociadas.</p>
                <button onclick="volverAlMenu()" class="action-btn">
                    <i class="fas fa-arrow-left"></i> Volver al menú
                </button>
            </div>
        `;
        return;
    }
    
    if (preguntaLecturaIndex >= preguntasLecturaActual.length) {
        finishExam();
        return;
    }

    const q = preguntasLecturaActual[preguntaLecturaIndex];
    const progreso = ((preguntaLecturaIndex) / preguntasLecturaActual.length) * 100;

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${preguntaLecturaIndex + 1} de ${preguntasLecturaActual.length}</span>
                <span>${Math.round(progreso)}% completado</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h3><i class="fas fa-file-alt"></i> ${q.categoria}</h3>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${q.opciones.map((op, i) => `
                <div class="option-card" onclick="responderLecturaIndividual(${i})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderLecturaIndividual(indexSeleccionado) {
    const q = preguntasLecturaActual[preguntaLecturaIndex];
    respuestasUsuario.push({
        correcta: indexSeleccionado === q.correcta,
        categoria: q.categoria,
        subcategoria: q.subcategoria,
        preguntaId: q.id || null,
        preguntaTexto: q.pregunta,
        pregunta: q.opciones[indexSeleccionado],
        opciones: q.opciones,
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: q.correcta
    });
    preguntaLecturaIndex++;
    mostrarPreguntaLecturaIndividual();
}

function mostrarMenuRazonamiento() {
    const patronesCount = preguntas.filter(p => p.categoria === "Razonamiento Lógico" && p.subcategoria === "patrones").length;
    const logicaCount = preguntas.filter(p => p.categoria === "Razonamiento Lógico" && p.subcategoria === "logicamatematica").length;
    const resolucionCount = preguntas.filter(p => p.categoria === "Razonamiento Lógico" && p.subcategoria === "resolucionproblemas").length;
    
    examContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2><i class="fas fa-brain"></i> Razonamiento Lógico</h2>
            <p>Elige un área para practicar TODAS sus preguntas</p>
            <div class="menu-options" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
                <button onclick="iniciarRazonamientoSubtipo('patrones')" class="menu-btn">
                    <i class="fas fa-shapes"></i> Patrones<br>
                    <small>${patronesCount} preguntas disponibles</small>
                </button>
                <button onclick="iniciarRazonamientoSubtipo('logicamatematica')" class="menu-btn">
                    <i class="fas fa-calculator"></i> Lógico Matemático<br>
                    <small>${logicaCount} preguntas disponibles</small>
                </button>
                <button onclick="iniciarRazonamientoSubtipo('resolucionproblemas')" class="menu-btn">
                    <i class="fas fa-puzzle-piece"></i> Resolución de Problemas<br>
                    <small>${resolucionCount} preguntas disponibles</small>
                </button>
            </div>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666; margin-top: 30px;">
                <i class="fas fa-arrow-left"></i> Volver al menú
            </button>
        </div>
    `;
    examContainer.style.display = "block";
    document.getElementById("mainMenu").style.display = "none";
}

function iniciarRazonamientoSubtipo(subtipo) {
    respuestasUsuario = [];
    isPremium = false;
    const preguntasSubtipo = preguntas.filter(p => p.categoria === "Razonamiento Lógico" && p.subcategoria === subtipo);
    razonamientoSeleccionado = mezclarPreguntasYopciones(preguntasSubtipo);
    razonamientoIndex = 0;
    mostrarPreguntaRazonamientoSubtipo();
}

function mostrarPreguntaRazonamientoSubtipo() {
    if (razonamientoIndex >= razonamientoSeleccionado.length) {
        finishExam();
        return;
    }

    const q = razonamientoSeleccionado[razonamientoIndex];
    const progreso = ((razonamientoIndex) / razonamientoSeleccionado.length) * 100;
    const nombreSubtipo = obtenerNombreSubtipo(q.subcategoria);

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${razonamientoIndex + 1} de ${razonamientoSeleccionado.length}</span>
                <span>${Math.round(progreso)}% completado</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-brain"></i> ${nombreSubtipo}</h2>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${q.opciones.map((op, i) => `
                <div class="option-card" onclick="responderRazonamientoSubtipo(${i})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderRazonamientoSubtipo(indexSeleccionado) {
    const q = razonamientoSeleccionado[razonamientoIndex];
    respuestasUsuario.push({
        correcta: indexSeleccionado === q.correcta,
        categoria: q.categoria,
        subcategoria: q.subcategoria,
        preguntaId: q.id || null,
        preguntaTexto: q.pregunta,
        pregunta: q.opciones[indexSeleccionado],
        opciones: q.opciones,
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: q.correcta
    });
    razonamientoIndex++;
    mostrarPreguntaRazonamientoSubtipo();
}

function mostrarMenuConocimientos() {
    const materiasConConteo = {};
    preguntas.forEach(p => {
        if (p.categoria === "Conocimientos Generales" && p.materia) {
            if (!materiasConConteo[p.materia]) {
                materiasConConteo[p.materia] = 0;
            }
            materiasConConteo[p.materia]++;
        }
    });
    
    examContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2><i class="fas fa-book"></i> Conocimientos Generales</h2>
            <p>Elige una materia para practicar TODAS sus preguntas</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 30px;">
                ${Object.entries(materiasConConteo).map(([materia, cantidad]) => `
                    <button onclick="iniciarConocimientosMateria('${materia}')" class="menu-btn" style="padding: 15px;">
                        <i class="fas fa-graduation-cap"></i> ${capitalizeFirstLetter(materia)}<br>
                        <small>${cantidad} preguntas disponibles</small>
                    </button>
                `).join('')}
            </div>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666;">
                <i class="fas fa-arrow-left"></i> Volver al menú
            </button>
        </div>
    `;
    examContainer.style.display = "block";
    document.getElementById("mainMenu").style.display = "none";
}

function iniciarConocimientosMateria(materia) {
    respuestasUsuario = [];
    isPremium = false;
    const preguntasMateria = preguntas.filter(p => p.categoria === "Conocimientos Generales" && p.materia === materia);
    console.log(`Cargando ${preguntasMateria.length} preguntas de ${materia}`);
    conocimientosSeleccionados = mezclarPreguntasYopciones(preguntasMateria);
    conocimientosIndex = 0;
    mostrarPreguntaConocimientosMateria();
}

function mostrarPreguntaConocimientosMateria() {
    if (conocimientosIndex >= conocimientosSeleccionados.length) {
        finishExam();
        return;
    }

    const q = conocimientosSeleccionados[conocimientosIndex];
    const progreso = ((conocimientosIndex) / conocimientosSeleccionados.length) * 100;

    examContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span>Pregunta ${conocimientosIndex + 1} de ${conocimientosSeleccionados.length}</span>
                <span>${Math.round(progreso)}% completado</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progreso}%"></div>
            </div>
        </div>
        <h2><i class="fas fa-book"></i> ${capitalizeFirstLetter(q.materia)}</h2>
        <div class="question-text">${q.pregunta}</div>
        <div id="optionsContainer">
            ${q.opciones.map((op, i) => `
                <div class="option-card" onclick="responderConocimientosMateria(${i})">
                    <div class="option-content">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div>${op}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function responderConocimientosMateria(indexSeleccionado) {
    const q = conocimientosSeleccionados[conocimientosIndex];
    respuestasUsuario.push({
        correcta: indexSeleccionado === q.correcta,
        categoria: q.categoria,
        subcategoria: q.materia,
        preguntaId: q.id || null,
        preguntaTexto: q.pregunta,
        pregunta: q.opciones[indexSeleccionado],
        opciones: q.opciones,
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: q.correcta
    });
    conocimientosIndex++;
    mostrarPreguntaConocimientosMateria();
}

function mostrarMenuSocioemocional() {
    const preguntasSocio = preguntas.filter(p => p.categoria === "Habilidades Socioemocionales");
    examContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2><i class="fas fa-heart"></i> Habilidades Socioemocionales</h2>
            <p>Practica las ${preguntasSocio.length} preguntas de habilidades socioemocionales</p>
            <button onclick="iniciarSocioemocional()" class="start-btn" style="font-size: 1.2rem; padding: 15px 30px;">
                <i class="fas fa-play"></i> Comenzar práctica (${preguntasSocio.length} preguntas)
            </button>
            <div style="margin-top: 20px; color: #666; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Todas las preguntas se mostrarán en orden aleatorio
            </div>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666; margin-top: 30px;">
                <i class="fas fa-arrow-left"></i> Volver al menú
            </button>
        </div>
    `;
    examContainer.style.display = "block";
    document.getElementById("mainMenu").style.display = "none";
}

function iniciarSocioemocional() {
    respuestasUsuario = [];
    isPremium = false;
    const preguntasSocio = preguntas.filter(p => p.categoria === "Habilidades Socioemocionales");
    console.log(`Cargando ${preguntasSocio.length} preguntas socioemocionales`);
    socioemocionalesSeleccionadas = mezclarPreguntasYopciones(preguntasSocio);
    socioIndex = 0;
    mostrarPreguntaSocioemocional();
}

/************ RESULTADOS ************/
function finishExam() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const email = prompt(
        "📧 ACCESO PREMIUM\n\n" +
        "Si tienes acceso premium, ingresa tu correo registrado.\n" +
        "Si no, deja vacío y obtendrás resultados básicos.\n\n" +
        "Correo:"
    );

    if (email && correosPremium.includes(email.trim())) {
        isPremium = true;
        alert("✅ ¡Acceso premium activado! Verás resultados completos.");
    }

    if (timerInterval !== null) {
        timer.style.color = "#e74c3c";
        timer.style.animation = "pulse 1s infinite";
    }

    let correctasTotales = respuestasUsuario.filter(r => r.correcta).length;
    let totalPreguntas = respuestasUsuario.length;
    let notaFinal = totalPreguntas > 0 ? (correctasTotales / totalPreguntas * 100).toFixed(2) : "0.00";

    let notaColor = "#e74c3c";
    if (parseFloat(notaFinal) >= 60) notaColor = "#f39c12";
    if (parseFloat(notaFinal) >= 70) notaColor = "#3498db";
    if (parseFloat(notaFinal) >= 80) notaColor = "#2ecc71";

    let secciones = {};
    respuestasUsuario.forEach(r => {
        if (!secciones[r.categoria]) secciones[r.categoria] = { correctas: 0, total: 0 };
        secciones[r.categoria].total++;
        if (r.correcta) secciones[r.categoria].correctas++;
    });

    if (isPremium) {
        mostrarResultadosPremium(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones);
    } else {
        mostrarResultadosGratis(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones);
    }
}

function mostrarResultadosGratis(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones) {
    examContainer.innerHTML = `
        <div class="results-summary">
            <h2><i class="fas fa-trophy"></i> ¡Examen Finalizado!</h2>
            <div class="final-score" style="color: ${notaColor}; font-size: 5rem; margin: 20px 0;">${notaFinal}</div>
            <p style="font-size: 1.3rem; margin-bottom: 10px;">Nota Final / 100</p>
            <p style="font-size: 1.1rem;"><strong>${correctasTotales}</strong> respuestas correctas de <strong>${totalPreguntas}</strong> preguntas</p>
        </div>
        ${mostrarMensajePremium()}
        <div class="action-buttons">
            <button onclick="reiniciarExamenCompleto()" class="action-btn restart-btn">
                <i class="fas fa-redo"></i> Reiniciar
            </button>
            <button onclick="descargarResultadosBasicos()" class="action-btn download-btn">
                <i class="fas fa-download"></i> Descargar Resultados
            </button>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666;">
                <i class="fas fa-home"></i> Volver al Menú
            </button>
        </div>
    `;
}

function mostrarResultadosPremium(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones) {
    examContainer.innerHTML = `
        <div class="results-summary">
            <h2><i class="fas fa-crown"></i> ¡Examen Finalizado - VERSIÓN PREMIUM!</h2>
            <div class="final-score" style="color: ${notaColor}; border: 3px solid #FFD700; font-size: 5rem;">${notaFinal}</div>
            <p style="font-size: 1.3rem; margin-bottom: 10px;">Nota Final / 100</p>
            <p><strong>${correctasTotales}</strong> respuestas correctas de <strong>${totalPreguntas}</strong> preguntas</p>
        </div>
        <h3 style="text-align: center; margin: 40px 0 20px; color: #2c3e50;">
            <i class="fas fa-chart-bar"></i> Resultados por Sección - ANÁLISIS COMPLETO
        </h3>
        <div class="section-stats">
            ${Object.keys(secciones).map(sec => {
                const porcentaje = ((secciones[sec].correctas / secciones[sec].total) * 100).toFixed(1);
                let colorBarra = "#e74c3c";
                if (porcentaje >= 60) colorBarra = "#f39c12";
                if (porcentaje >= 70) colorBarra = "#3498db";
                if (porcentaje >= 80) colorBarra = "#2ecc71";
                const preguntasSeccion = respuestasUsuario.filter(r => r.categoria === sec);
                const errores = preguntasSeccion.filter(r => !r.correcta).length;
                return `
                <div class="stat-card" style="border: 2px solid #4CAF50;">
                    <h3>${sec} <span style="color: #4CAF50; font-size: 0.8em;">(PREMIUM)</span></h3>
                    <div class="score">${secciones[sec].correctas}/${secciones[sec].total}</div>
                    <div class="percentage">${porcentaje}% de acierto</div>
                    <div class="progress-bar" style="margin-top: 15px; height: 8px;">
                        <div class="progress-fill" style="width: ${porcentaje}%; background: ${colorBarra}"></div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        <div>✅ Correctas: ${secciones[sec].correctas}</div>
                        <div>❌ Errores: ${errores}</div>
                        <div>📊 Efectividad: ${porcentaje}%</div>
                    </div>
                </div>
                `;
            }).join("")}
        </div>
        <button onclick="mostrarDetalleRespuestasPremium()" class="details-toggle" style="background: #4CAF50; color: white;">
            <i class="fas fa-eye"></i> Ver análisis detallado PREMIUM
        </button>
        <div id="detalleRespuestasPremium" style="display: none;"></div>
        ${mostrarAgradecimientoPremium()}
        <div class="action-buttons">
            <button onclick="reiniciarExamenCompleto()" class="action-btn restart-btn">
                <i class="fas fa-redo"></i> Reiniciar
            </button>
            <button onclick="descargarResultadosPremium()" class="action-btn download-btn" style="background: #9C27B0;">
                <i class="fas fa-download"></i> Descargar Reporte Premium
            </button>
            <button onclick="volverAlMenu()" class="action-btn" style="background: #666;">
                <i class="fas fa-home"></i> Volver al Menú
            </button>
        </div>
    `;
}

function mostrarMensajePremium() {
    return `
        <div class="premium-box" style="border: 2px solid #FF9800; background: #FFF8E1; padding: 20px; border-radius: 15px; margin: 30px 0;">
            <h3 style="color: #EF6C00; margin-top: 0;"><i class="fas fa-crown"></i> FUNCIONES PREMIUM BLOQUEADAS</h3>
            <p>Para desbloquear el análisis completo:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                <div style="background: white; padding: 15px; border-radius: 10px;">
                    <strong>✅ Lo que ves ahora (GRATIS):</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Nota final</li>
                        <li>Solo el número de nota</li>
                        <li>Sin ver tus errores</li>
                    </ul>
                </div>
                <div style="background: #F1F8E9; padding: 15px; border-radius: 10px;">
                    <strong>💎 Lo que obtienes con PREMIUM (Bs ${contactoDonaciones.montoPremium}.00):</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>📊 Resultados por sección</li>
                        <li>✅ Respuestas correctas detalladas</li>
                        <li>❌ Tus errores con explicación</li>
                        <li>📈 Estadísticas por área avanzadas</li>
                        <li>📄 Reporte premium descargable</li>
                    </ul>
                </div>
            </div>
            ${mostrarPanelDonaciones()}
        </div>
    `;
}

function mostrarDetalleRespuestasPremium() {
    const detalleDiv = document.getElementById("detalleRespuestasPremium");
    const toggleBtn = document.querySelector('.details-toggle[style*="background: #4CAF50"]');
    if (!detalleDiv) return;
    if (detalleDiv.style.display === "none") {
        detalleDiv.innerHTML = `
            <h3 style="text-align: center; margin: 40px 0 20px; color: #2c3e50;">
                <i class="fas fa-list-check"></i> REVISIÓN COMPLETA PREMIUM (${respuestasUsuario.length} preguntas)
            </h3>
            <div class="details-container">
                ${respuestasUsuario.map((r, index) => {
                    const textoSeleccionado = r.opciones && r.opciones[r.seleccion] ? 
                        r.opciones[r.seleccion] : "No registrada";
                    const opcionCorrecta = r.opciones ? 
                        r.opciones[r.indiceCorrectoOriginal] || "No encontrada" : "No disponible";
                    const esCorrecta = r.correcta;
                    const enunciadoPregunta = (r.preguntaTexto && r.preguntaTexto.trim() !== "") ? 
                        r.preguntaTexto : 
                        `Pregunta de ${r.categoria} sobre ${r.subcategoria || r.materia || "el tema"}`;
                    return `
                    <div class="answer-item ${esCorrecta ? 'correct' : 'incorrect'}" style="margin-bottom: 25px; padding: 20px; border-radius: 10px; ${!esCorrecta ? 'border-left: 5px solid #e74c3c; background: #FFF5F5;' : 'border-left: 5px solid #2ecc71; background: #F5FFF5;'}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="font-size: 1.1rem; font-weight: bold; color: #2c3e50;">
                                <span style="background: ${esCorrecta ? '#2ecc71' : '#e74c3c'}; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.9rem; margin-right: 10px;">
                                    ${index + 1}
                                </span>
                                ${r.categoria}
                            </div>
                            <span style="font-weight: bold; color: ${esCorrecta ? '#27ae60' : '#c0392b'};">
                                ${esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}
                            </span>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin: 0 0 10px 0; color: #3498db; font-size: 1rem;">
                                <i class="fas fa-question-circle"></i> Pregunta:
                            </h4>
                            <p style="margin: 0; line-height: 1.5; font-size: 1.05rem;">${enunciadoPregunta}</p>
                        </div>
                        <div style="margin: 15px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <div style="background: ${esCorrecta ? '#E8F5E9' : '#FFEBEE'}; padding: 12px; border-radius: 8px;">
                                <strong style="color: #2c3e50;">Tu respuesta:</strong>
                                <p style="margin: 5px 0 0 0; ${!esCorrecta ? 'color: #c0392b; font-weight: bold;' : 'color: #27ae60;'}">${textoSeleccionado}</p>
                            </div>
                            ${!esCorrecta ? `
                            <div style="background: #E3F2FD; padding: 12px; border-radius: 8px;">
                                <strong style="color: #1565C0;">Respuesta correcta:</strong>
                                <p style="margin: 5px 0 0 0; color: #2ecc71; font-weight: bold;">${opcionCorrecta}</p>
                            </div>` : ''}
                        </div>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 0.9rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
                            <div><i class="fas fa-book"></i> <strong>Área:</strong> ${r.subcategoria || r.materia || "General"}</div>
                            <div><i class="fas fa-chart-bar"></i> <strong>Estado:</strong> ${esCorrecta ? 'Acertada' : 'Por mejorar'}</div>
                        </div>
                        ${!esCorrecta ? `
                        <div style="margin-top: 15px; padding: 12px; background: #FFF8E1; border-radius: 8px; border-left: 4px solid #FF9800;">
                            <p style="margin: 0; color: #E65100; font-size: 0.95rem;">
                                <i class="fas fa-lightbulb"></i> <strong>Recomendación:</strong> Revisa este tema en "${r.subcategoria || r.materia || "esta área"}" para mejorar.
                            </p>
                        </div>` : ''}
                    </div>`;
                }).join("")}
            </div>
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: center;">
                <h4 style="color: #2c3e50; margin-top: 0;"><i class="fas fa-chart-pie"></i> Resumen de tu desempeño</h4>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #2ecc71;">${respuestasUsuario.filter(r => r.correcta).length}</div>
                        <div style="font-size: 0.9em; color: #666;">Correctas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #e74c3c;">${respuestasUsuario.filter(r => !r.correcta).length}</div>
                        <div style="font-size: 0.9em; color: #666;">Incorrectas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #3498db;">${((respuestasUsuario.filter(r => r.correcta).length / respuestasUsuario.length) * 100).toFixed(1)}%</div>
                        <div style="font-size: 0.9em; color: #666;">Efectividad</div>
                    </div>
                </div>
            </div>`;
        detalleDiv.style.display = "block";
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar revisión';
    } else {
        detalleDiv.style.display = "none";
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Ver revisión completa PREMIUM';
    }
}

function mostrarPanelDonaciones() {
    return `
        <div class="donacion-box" style="border: 2px solid #4CAF50; background: #f0fff4; padding: 20px; border-radius: 15px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h3 style="color: #2E7D32; margin-top: 0;"><i class="fas fa-gift"></i> OBTÉN PREMIUM - Bs ${contactoDonaciones.montoPremium}.00</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 25px; align-items: center; justify-content: center;">
                <div style="flex: 1; min-width: 250px;">
                    <h4><i class="fas fa-qrcode"></i> VÍA YAPE:</h4>
                    <div style="background: white; padding: 15px; border-radius: 10px; display: inline-block; margin: 10px 0;">
                        <img src="${contactoDonaciones.yapeQR}" alt="QR Yape" style="width: 200px; height: 200px; border: 2px solid #ddd; border-radius: 10px;">
                    </div>
                    <p><strong>Monto:</strong> Bs ${contactoDonaciones.montoPremium}.00</p>
                </div>
                <div style="flex: 1; min-width: 250px; text-align: left;">
                    <h4><i class="fas fa-list-ol"></i> PASOS PARA ACTIVAR PREMIUM:</h4>
                    <ol style="padding-left: 20px;">
                        <li>Paga <strong>Bs ${contactoDonaciones.montoPremium}.00</strong> por Yape</li>
                        <li>Toma captura del comprobante</li>
                        <li>Envíalo al WhatsApp:<br><a href="https://wa.me/${contactoDonaciones.celular}" target="_blank" style="color: #25D366; font-weight: bold;">${contactoDonaciones.celular}</a></li>
                        <li>Indica tu correo:<br><em>(el que usarás en el examen)</em></li>
                        <li>Te activaremos en < 24 horas</li>
                    </ol>
                    <div style="margin-top: 20px;">
                        <a href="https://wa.me/${contactoDonaciones.celular}?text=Hola%2C%20quiero%20activar%20Premium%20por%20Bs%20${contactoDonaciones.montoPremium}" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 10px 0;">
                           <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;"><i class="fas fa-info-circle"></i> <em>Tu apoyo mantiene vivo este proyecto educativo. ¡Gracias!</em></p>
        </div>
    `;
}

function mostrarAgradecimientoPremium() {
    return `
        <div style="border: 3px solid #9C27B0; background: #F3E5F5; padding: 20px; border-radius: 15px; margin: 30px 0; text-align: center;">
            <h3 style="color: #7B1FA2; margin-top: 0;"><i class="fas fa-star"></i> ¡GRACIAS POR SER PREMIUM!</h3>
            <p>Tu acceso está activo. Si deseas apoyar adicionalmente el proyecto o compartir con un amigo:</p>
            <div style="margin: 20px 0;">${mostrarPanelDonaciones()}</div>
        </div>
    `;
}

function descargarResultadosBasicos() {
    let correctasTotales = respuestasUsuario.filter(r => r.correcta).length;
    let totalPreguntas = respuestasUsuario.length;
    let notaFinal = totalPreguntas > 0 ? (correctasTotales / totalPreguntas * 100).toFixed(2) : "0.00";
    let contenido = `
EXAMEN SIMULADOR - RESULTADO BÁSICO
===================================
Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
Nota Final: ${notaFinal}/100
Correctas: ${correctasTotales} de ${totalPreguntas}

¿QUIERES RESULTADOS COMPLETOS?
===============================
Con la versión PREMIUM obtienes:
✓ Resultados por sección
✓ Respuestas correctas detalladas  
✓ Tus errores con explicación
✓ Estadísticas por área avanzadas
✓ Reporte premium descargable

PRECIO: Bs ${contactoDonaciones.montoPremium}.00

CONTACTO:
---------
📱 WhatsApp: ${contactoDonaciones.celular}
📧 Correo: ${contactoDonaciones.correoContacto}
💳 Yape: ${contactoDonaciones.celular}

¡Gracias por usar el simulador!`;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_examen_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Resultados básicos descargados. ¡Obtén Premium para ver análisis completo!");
}

function descargarResultadosPremium() {
    let correctasTotales = respuestasUsuario.filter(r => r.correcta).length;
    let totalPreguntas = respuestasUsuario.length;
    let notaFinal = totalPreguntas > 0 ? (correctasTotales / totalPreguntas * 100).toFixed(2) : "0.00";
    let contenido = `EXAMEN SIMULADOR - REPORTE PREMIUM COMPLETO
===========================================
Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
Nota Final: ${notaFinal}/100
Correctas: ${correctasTotales} de ${totalPreguntas}
Versión: PREMIUM (acceso completo)

RESULTADOS POR SECCIÓN:`;
    let secciones = {};
    respuestasUsuario.forEach(r => {
        if (!secciones[r.categoria]) secciones[r.categoria] = { correctas: 0, total: 0 };
        secciones[r.categoria].total++;
        if (r.correcta) secciones[r.categoria].correctas++;
    });
    Object.keys(secciones).forEach(sec => {
        const porcentaje = ((secciones[sec].correctas / secciones[sec].total) * 100).toFixed(1);
        const preguntasSeccion = respuestasUsuario.filter(r => r.categoria === sec);
        const errores = preguntasSeccion.filter(r => !r.correcta).length;
        contenido += `
${sec}:
  Correctas: ${secciones[sec].correctas} de ${secciones[sec].total}
  Errores: ${errores}
  Porcentaje: ${porcentaje}%
  Efectividad: ${porcentaje >= 70 ? "ALTA" : porcentaje >= 50 ? "MEDIA" : "BAJA"}`;
    });
    contenido += `\n\nDETALLE COMPLETO DE RESPUESTAS:`;
    respuestasUsuario.forEach((r, index) => {
        const textoSeleccionado = r.opciones && r.opciones[r.seleccion] ?
            r.opciones[r.seleccion] : "No registrada";
        const opcionCorrecta = r.opciones ?
            r.opciones[r.indiceCorrectoOriginal] || "No encontrada" : "No disponible";
        const esCorrecta = r.correcta;
        contenido += `
${index + 1}. ${r.categoria} - ${r.subcategoria || r.materia || ""}
   Estado: ${esCorrecta ? "CORRECTA" : "INCORRECTA"}
   Tu respuesta: ${textoSeleccionado}
   ${!esCorrecta ? `Respuesta correcta: ${opcionCorrecta}` : ''}
   ${!esCorrecta ? `Recomendación: Revisar tema de ${r.subcategoria || r.materia || "esta área"}` : ''}`;
    });
    contenido += `\n\nESTADÍSTICAS AVANZADAS:
======================
Total preguntas: ${totalPreguntas}
Preguntas correctas: ${correctasTotales} (${((correctasTotales / totalPreguntas) * 100).toFixed(1)}%)
Preguntas incorrectas: ${totalPreguntas - correctasTotales} (${(((totalPreguntas - correctasTotales) / totalPreguntas) * 100).toFixed(1)}%)

RECOMENDACIONES:`;
    Object.keys(secciones).forEach(sec => {
        const porcentaje = ((secciones[sec].correctas / secciones[sec].total) * 100).toFixed(1);
        let recomendacion = "";
        if (porcentaje < 50) recomendacion = "Necesita estudio intensivo";
        else if (porcentaje < 70) recomendacion = "Requiere práctica moderada";
        else if (porcentaje < 85) recomendacion = "Buen desempeño, puede mejorar";
        else recomendacion = "Excelente desempeño";
        contenido += `
- ${sec}: ${porcentaje}% - ${recomendacion}`;
    });
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_premium_examen_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("¡Reporte Premium descargado! Contiene análisis completo.");
}

function reiniciarExamenCompleto() {
    totalTime = 120 * 60;
    timerInterval = null;
    lecturasSeleccionadas = [];
    lecturaActual = 0;
    preguntasLecturaActual = [];
    preguntaLecturaIndex = 0;
    respuestasUsuario = [];
    razonamientoSeleccionado = [];
    razonamientoIndex = 0;
    conocimientosSeleccionados = [];
    conocimientosIndex = 0;
    socioemocionalesSeleccionadas = [];
    socioIndex = 0;
    timer.textContent = "Tiempo: 120:00";
    timer.style.color = "white";
    timer.style.animation = "none";
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar Examen';
    examContainer.style.display = "none";
    mostrarMenuPrincipal();
}

// Inicializar menú principal cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarMenuPrincipal();
});


