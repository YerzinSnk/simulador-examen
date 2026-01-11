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

/************ RAZONAMIENTO LÓGICO ************/
let razonamientoSeleccionado = [];
let razonamientoIndex = 0;

/************ CONOCIMIENTOS GENERALES ************/
let conocimientosSeleccionados = [];
let conocimientosIndex = 0;

/************ HABILIDADES SOCIOEMOCIONALES ************/
let socioemocionalesSeleccionadas = [];
let socioIndex = 0;

/************ SISTEMA PREMIUM ************/
let isPremium = false;
const correosPremium = [
    "yerzinsinka7@gmail.com",
    "admin@examen.com",
    "anethycasal@gmail.com",
];

/************ DATOS DE DONACIONES ************/
const contactoDonaciones = {
    yapeQR: "https://i.ibb.co/mF99V38X/Whats-App-Image-2026-01-09-at-2-06-26-PM.jpg",
    celular: "59177247092",  // ← CÓDIGO 591 (Bolivia)
    montoPremium: 15,        // ← Bs 15 (Bolivianos)
    correoContacto: "yerzinsinka7@gmail.com"
};

/************ ELEMENTOS HTML ************/
const startBtn = document.getElementById("startBtn");
const timer = document.getElementById("timer");
const examContainer = document.getElementById("examContainer");

/************ CARGAR PREGUNTAS ************/
fetch("preguntas.json")
    .then(res => res.json())
    .then(data => {
        preguntas = data;
        console.log("Preguntas cargadas:", preguntas.length);
        // Habilitar botón cuando ambas cargas estén listas
        if (lecturas.length > 0) {
            startBtn.disabled = false;
        }
    })
    .catch(err => console.error("Error cargando preguntas:", err));

/************ CARGAR LECTURAS ************/
async function cargarLecturas() {
    try {
        const response = await fetch("lecturas.json");
        lecturas = await response.json();
        console.log("Lecturas cargadas:", lecturas.length);
        // Habilitar botón cuando ambas cargas estén listas
        if (preguntas.length > 0) {
            startBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error cargando lecturas:", error);
    }
}
cargarLecturas();

/************ INICIAR EXAMEN ************/
startBtn.addEventListener("click", () => {
    if (timerInterval !== null) return;

    // Verificar que las lecturas y preguntas estén cargadas
    if (lecturas.length === 0 || preguntas.length === 0) {
        alert("Esperando a que carguen las preguntas y lecturas. Por favor, intenta de nuevo.");
        return;
    }

    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Examen iniciado';
    examContainer.style.display = "block";

    // Reiniciar variables para nuevo examen
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
    isPremium = false; // Reiniciar premium para cada examen

    seleccionarLecturasAleatorias();
    mostrarLectura(lecturasSeleccionadas[0]);

    timerInterval = setInterval(actualizarTimer, 1000);
});

/************ TIMER ************/
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

/************ SELECCIONAR 3 LECTURAS ALEATORIAS ************/
function seleccionarLecturasAleatorias() {
    // Crear copia del array de lecturas para no modificar el original
    const copiaLecturas = [...lecturas];

    // Mezclar aleatoriamente las lecturas
    for (let i = copiaLecturas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiaLecturas[i], copiaLecturas[j]] = [copiaLecturas[j], copiaLecturas[i]];
    }

    // Seleccionar las primeras 3 lecturas
    lecturasSeleccionadas = copiaLecturas.slice(0, 3);

    console.log("Lecturas seleccionadas aleatoriamente:", lecturasSeleccionadas.map(l => l.id));
}

/************ MOSTRAR LECTURA ************/
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
        <div class="lecture-content">
            ${lectura.texto}
        </div>
        <button onclick="comenzarPreguntasLectura()" class="start-btn">
            <i class="fas fa-forward"></i> Comenzar preguntas de esta lectura
        </button>
    `;
}

/************ OBTENER PREGUNTAS DE UNA LECTURA (ALEATORIAS) ************/
function obtenerPreguntasDeLectura(idLectura) {
    // Filtrar preguntas por subcategoría (id de la lectura)
    const preguntasFiltradas = preguntas.filter(p => p.subcategoria === idLectura);

    // Verificar que hay preguntas disponibles
    if (preguntasFiltradas.length === 0) {
        console.warn(`No hay preguntas para la lectura ${idLectura}`);
        return [];
    }

    // Mezclar aleatoriamente las preguntas
    const preguntasMezcladas = [...preguntasFiltradas];
    for (let i = preguntasMezcladas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [preguntasMezcladas[i], preguntasMezcladas[j]] = [preguntasMezcladas[j], preguntasMezcladas[i]];
    }

    // Tomar 12 preguntas aleatorias (o menos si no hay suficientes)
    const cantidadPreguntas = Math.min(12, preguntasMezcladas.length);
    return preguntasMezcladas.slice(0, cantidadPreguntas);
}

/************ COMENZAR PREGUNTAS LECTURA ************/
function comenzarPreguntasLectura() {
    if (!lecturasSeleccionadas[lecturaActual]) {
        console.error("No hay lectura actual seleccionada");
        return;
    }

    preguntasLecturaActual = obtenerPreguntasDeLectura(
        lecturasSeleccionadas[lecturaActual].id
    );

    // Verificar que se obtuvieron preguntas
    if (preguntasLecturaActual.length === 0) {
        alert(`No hay preguntas disponibles para esta lectura. Pasando a la siguiente...`);
        siguienteLectura();
        return;
    }

    console.log(`Preguntas para lectura ${lecturaActual + 1}: ${preguntasLecturaActual.length} preguntas`);
    preguntaLecturaIndex = 0;
    mostrarPreguntaLectura();
}

/************ MOSTRAR PREGUNTA LECTURA ************/
function mostrarPreguntaLectura() {
    if (preguntaLecturaIndex >= preguntasLecturaActual.length) {
        siguienteLectura();
        return;
    }

    const q = preguntasLecturaActual[preguntaLecturaIndex];
    const preguntasPorLectura = 12;
    const preguntasTotales = 3 * preguntasPorLectura;
    const progreso = ((lecturaActual * preguntasPorLectura + preguntaLecturaIndex + 1) / preguntasTotales) * 100;

    // Crear opciones y mezclarlas aleatoriamente
    let opciones = q.opciones.map((op, i) => ({
        texto: op,
        correcta: i === q.correcta,
        indiceOriginal: i
    }));

    // Mezclar las opciones de respuesta
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
        <div class="question-text">
            ${q.pregunta}
        </div>
        
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

/************ FUNCIÓN PARA PASAR A SIGUIENTE LECTURA ************/
function siguienteLectura() {
    lecturaActual++;
    if (lecturaActual < lecturasSeleccionadas.length) {
        mostrarLectura(lecturasSeleccionadas[lecturaActual]);
    } else {
        seleccionarRazonamientoAleatorio();
        mostrarPreguntaRazonamiento();
    }
}

/************ RESPONDER PREGUNTA LECTURA ************/
function responderLectura(indexSeleccionado, opciones, categoria, subcategoria, preguntaId) {
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria,
        preguntaId,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });

    preguntaLecturaIndex++;
    mostrarPreguntaLectura();
}

/************ SELECCIONAR PREGUNTAS RAZONAMIENTO LÓGICO (ALEATORIAS) ************/
function seleccionarRazonamientoAleatorio() {
    // Obtener preguntas de cada subcategoría y mezclarlas
    const patrones = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "patrones"), 12);
    const logica = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "logicamatematica"), 12);
    const resolucion = mezclarPreguntas(preguntas.filter(p => p.subcategoria === "resolucionproblemas"), 13);

    // Combinar todas las preguntas
    razonamientoSeleccionado = [...patrones, ...logica, ...resolucion];

    // Mezclar el orden de las preguntas de razonamiento
    for (let i = razonamientoSeleccionado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [razonamientoSeleccionado[i], razonamientoSeleccionado[j]] = [razonamientoSeleccionado[j], razonamientoSeleccionado[i]];
    }

    razonamientoIndex = 0;
}

/************ FUNCIÓN AUXILIAR PARA MEZCLAR Y SELECCIONAR PREGUNTAS ************/
function mezclarPreguntas(arrayPreguntas, cantidad) {
    if (arrayPreguntas.length === 0) return [];

    const mezcladas = [...arrayPreguntas];
    for (let i = mezcladas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
    }

    return mezcladas.slice(0, Math.min(cantidad, mezcladas.length));
}

/************ MOSTRAR PREGUNTA RAZONAMIENTO ************/
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

    // Crear y mezclar opciones
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
        <div class="question-text">
            ${q.pregunta}
        </div>
        
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

/************ RESPONDER PREGUNTA RAZONAMIENTO ************/
function responderRazonamiento(indexSeleccionado, opciones, categoria, subcategoria, preguntaId) {
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria,
        preguntaId,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });

    razonamientoIndex++;
    mostrarPreguntaRazonamiento();
}

/************ CONOCIMIENTOS GENERALES (ALEATORIOS) ************/
function obtenerPreguntasPorMateria(materia, cantidad) {
    const preguntasMateria = preguntas.filter(p =>
        p.categoria === "Conocimientos Generales" && p.materia === materia
    );
    return mezclarPreguntas(preguntasMateria, cantidad);
}

function seleccionarConocimientosAleatorios() {
    conocimientosSeleccionados = [
        ...obtenerPreguntasPorMateria("fisica", 3),
        ...obtenerPreguntasPorMateria("matematica", 3),
        ...obtenerPreguntasPorMateria("quimica", 3),
        ...obtenerPreguntasPorMateria("lenguaje", 3),
        ...obtenerPreguntasPorMateria("historia", 3),
        ...obtenerPreguntasPorMateria("geografia", 2),
        ...obtenerPreguntasPorMateria("psicologia", 2),
        ...obtenerPreguntasPorMateria("filosofia", 2),
        ...obtenerPreguntasPorMateria("biologia", 2),
        ...obtenerPreguntasPorMateria("tecnologia", 2)
    ];

    // Mezclar todas las preguntas de conocimientos
    for (let i = conocimientosSeleccionados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [conocimientosSeleccionados[i], conocimientosSeleccionados[j]] = [conocimientosSeleccionados[j], conocimientosSeleccionados[i]];
    }

    conocimientosIndex = 0;
}

/************ MOSTRAR PREGUNTA CONOCIMIENTOS ************/
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

    // Crear y mezclar opciones
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
        <div class="question-text">
            ${q.pregunta}
        </div>
        
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
    const opcionSeleccionada = opciones[indexSeleccionado];
    respuestasUsuario.push({
        correcta: opcionSeleccionada.correcta,
        categoria,
        subcategoria: materia,
        preguntaId,
        pregunta: opcionSeleccionada.texto,
        opciones: opciones.map(op => op.texto),
        seleccion: indexSeleccionado,
        indiceCorrectoOriginal: opciones.findIndex(op => op.correcta)
    });

    conocimientosIndex++;
    mostrarPreguntaConocimientos();
}

/************ HABILIDADES SOCIOEMOCIONALES (ALEATORIAS) ************/
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

    // Crear y mezclar opciones
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
        <div class="question-text">
            ${q.pregunta}
        </div>
        
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
        pregunta: preguntaCompleta.pregunta,
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

/************ FINALIZAR EXAMEN CON PREMIUM ************/
function finishExam() {
    clearInterval(timerInterval);

    // PEDIR CORREO PARA PREMIUM
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

    timer.style.color = "#e74c3c";
    timer.style.animation = "pulse 1s infinite";

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

    // MOSTRAR RESULTADOS SEGÚN PREMIUM
    if (isPremium) {
        mostrarResultadosPremium(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones);
    } else {
        mostrarResultadosGratis(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones);
    }
}

/************ MOSTRAR RESULTADOS GRATIS (SOLO NOTA FINAL) ************/
function mostrarResultadosGratis(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones) {
    examContainer.innerHTML = `
        <div class="results-summary">
            <h2><i class="fas fa-trophy"></i> ¡Examen Finalizado!</h2>
            <div class="final-score" style="color: ${notaColor}; font-size: 5rem; margin: 20px 0;">${notaFinal}</div>
            <p style="font-size: 1.3rem; margin-bottom: 10px;">Nota Final / 100</p>
            <p style="font-size: 1.1rem;"><strong>${correctasTotales}</strong> respuestas correctas de <strong>${totalPreguntas}</strong> preguntas</p>
            <p style="margin-top: 10px;"><i class="fas fa-clock"></i> Tiempo restante: ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</p>
        </div>

        <!-- PANEL DE PREMIUM PARA USUARIOS GRATIS -->
        ${mostrarMensajePremium()}
        
        <div class="action-buttons">
            <button onclick="reiniciarExamenCompleto()" class="action-btn restart-btn">
                <i class="fas fa-redo"></i> Reiniciar Examen
            </button>
            <button onclick="descargarResultadosBasicos()" class="action-btn download-btn">
                <i class="fas fa-download"></i> Descargar Resultados
            </button>
        </div>
    `;
}

/************ MOSTRAR RESULTADOS PREMIUM (COMPLETO) ************/
function mostrarResultadosPremium(notaFinal, notaColor, correctasTotales, totalPreguntas, secciones) {
    examContainer.innerHTML = `
        <div class="results-summary">
            <h2><i class="fas fa-crown"></i> ¡Examen Finalizado - VERSIÓN PREMIUM!</h2>
            <div class="final-score" style="color: ${notaColor}; border: 3px solid #FFD700; font-size: 5rem;">${notaFinal}</div>
            <p style="font-size: 1.3rem; margin-bottom: 10px;">Nota Final / 100</p>
            <p><strong>${correctasTotales}</strong> respuestas correctas de <strong>${totalPreguntas}</strong> preguntas</p>
            <p style="margin-top: 10px;"><i class="fas fa-clock"></i> Tiempo restante: ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</p>
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
        
        <!-- AGRADECIMIENTO PREMIUM -->
        ${mostrarAgradecimientoPremium()}
        
        <div class="action-buttons">
            <button onclick="reiniciarExamenCompleto()" class="action-btn restart-btn">
                <i class="fas fa-redo"></i> Reiniciar Examen
            </button>
            <button onclick="descargarResultadosPremium()" class="action-btn download-btn" style="background: #9C27B0;">
                <i class="fas fa-download"></i> Descargar Reporte Premium
            </button>
        </div>
    `;
}

/************ MOSTRAR DETALLE DE RESPUESTAS PREMIUM (CON PREGUNTA COMPLETA) ************/
function mostrarDetalleRespuestasPremium() {
    const detalleDiv = document.getElementById("detalleRespuestasPremium");
    const toggleBtn = document.querySelector('.details-toggle[style*="background: #4CAF50"]');

    if (!detalleDiv) return;

    if (detalleDiv.style.display === "none") {
        detalleDiv.innerHTML = `
            <h3 style="text-align: center; margin: 40px 0 20px; color: #2c3e50;">
                <i class="fas fa-list-check"></i> ANÁLISIS PREMIUM COMPLETO (${respuestasUsuario.length} preguntas)
            </h3>
            <div class="details-container">
                ${respuestasUsuario.map((r, index) => {
            const textoSeleccionado = r.opciones && r.opciones[r.seleccion] ?
                r.opciones[r.seleccion] : "No registrada";
            const opcionCorrecta = r.opciones ?
                r.opciones[r.indiceCorrectoOriginal] || "No encontrada" : "No disponible";
            const esCorrecta = r.correcta;
            
            // Obtener la pregunta completa (si está disponible)
            const preguntaCompleta = r.preguntaCompleta || r.pregunta || "Pregunta no disponible";
            const esPreguntaCompleta = preguntaCompleta.length > 50 || preguntaCompleta.includes('?');

            return `
                    <div class="answer-item ${esCorrecta ? 'correct' : 'incorrect'}" style="${!esCorrecta ? 'border-left: 5px solid #e74c3c;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <strong style="font-size: 1.1rem; color: #2c3e50;">
                                <i class="fas fa-question-circle"></i> Pregunta ${index + 1}
                            </strong>
                            <span style="font-weight: bold; color: ${esCorrecta ? '#27ae60' : '#c0392b'}; background: ${esCorrecta ? '#E8F5E9' : '#FFEBEE'}; padding: 5px 15px; border-radius: 20px;">
                                ${esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}
                            </span>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #3498db;">
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">
                                <i class="fas fa-file-alt"></i> Enunciado completo:
                            </h4>
                            <p style="margin: 0; line-height: 1.6; font-size: 1.05rem;">
                                ${esPreguntaCompleta ? preguntaCompleta : `"${preguntaCompleta}"`}
                            </p>
                        </div>
                        
                        <div style="margin: 15px 0;">
                            <p><strong><i class="fas fa-layer-group"></i> Área:</strong> ${r.categoria}</p>
                            <p><strong><i class="fas fa-tag"></i> Subárea:</strong> ${r.subcategoria || r.materia || "Sin categoría"}</p>
                        </div>
                        
                        <div style="background: ${esCorrecta ? '#E8F5E9' : '#FFEBEE'}; padding: 15px; border-radius: 10px; margin: 15px 0;">
                            <p style="margin: 0 0 8px 0;"><strong><i class="fas fa-user-check"></i> Tu respuesta:</strong></p>
                            <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid ${esCorrecta ? '#2ecc71' : '#e74c3c'};">
                                ${textoSeleccionado}
                            </div>
                        </div>
                        
                        ${!esCorrecta ? `
                            <div style="background: #E3F2FD; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #3498db;">
                                <p style="margin: 0 0 8px 0; color: #1565C0;"><strong><i class="fas fa-check-circle"></i> Respuesta correcta:</strong></p>
                                <div style="background: white; padding: 10px; border-radius: 5px; border: 2px solid #2ecc71;">
                                    <strong style="color: #27ae60;">${opcionCorrecta}</strong>
                                </div>
                            </div>
                            
                            <div style="background: #FFF8E1; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #FF9800;">
                                <p style="margin: 0 0 8px 0; color: #EF6C00;"><strong><i class="fas fa-lightbulb"></i> Análisis y recomendación:</strong></p>
                                <p style="margin: 0; color: #666;">
                                    Revisa el tema de <strong>${r.subcategoria || r.materia || "esta área"}</strong> ya que es un punto importante que necesitas reforzar para mejorar tu puntaje.
                                </p>
                            </div>
                        ` : `
                            <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #2ecc71;">
                                <p style="margin: 0; color: #27ae60;">
                                    <i class="fas fa-check"></i> <strong>¡Excelente!</strong> Dominas este tema correctamente.
                                </p>
                            </div>
                        `}
                        
                        <div style="margin-top: 15px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 0.9em; color: #666; display: flex; justify-content: space-between; flex-wrap: wrap;">
                            <div>
                                <strong><i class="fas fa-book"></i> Materia:</strong> ${r.subcategoria || r.materia || "General"}
                            </div>
                            <div>
                                <strong><i class="fas fa-hashtag"></i> ID:</strong> ${r.preguntaId || "N/A"}
                            </div>
                            <div>
                                <strong><i class="fas fa-star"></i> Dificultad:</strong> ${index % 3 === 0 ? "Media" : index % 2 === 0 ? "Alta" : "Baja"}
                            </div>
                        </div>
                    </div>
                    `;
        }).join("")}
            </div>
            
            <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                <h4 style="color: white; margin-top: 0; text-align: center;">
                    <i class="fas fa-chart-line"></i> ESTADÍSTICAS AVANZADAS PREMIUM
                </h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; text-align: center; color: #2c3e50;">
                        <div style="font-size: 2em; font-weight: bold; color: #2E7D32; margin-bottom: 5px;">
                            ${respuestasUsuario.filter(r => r.correcta).length}
                        </div>
                        <div style="font-size: 0.9em;">
                            <i class="fas fa-check-circle"></i> Preguntas correctas
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; text-align: center; color: #2c3e50;">
                        <div style="font-size: 2em; font-weight: bold; color: #C62828; margin-bottom: 5px;">
                            ${respuestasUsuario.filter(r => !r.correcta).length}
                        </div>
                        <div style="font-size: 0.9em;">
                            <i class="fas fa-times-circle"></i> Preguntas incorrectas
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; text-align: center; color: #2c3e50;">
                        <div style="font-size: 2em; font-weight: bold; color: #1565C0; margin-bottom: 5px;">
                            ${((respuestasUsuario.filter(r => r.correcta).length / respuestasUsuario.length) * 100).toFixed(1)}%
                        </div>
                        <div style="font-size: 0.9em;">
                            <i class="fas fa-chart-bar"></i> Efectividad total
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; text-align: center; color: #2c3e50;">
                        <div style="font-size: 2em; font-weight: bold; color: #9C27B0; margin-bottom: 5px;">
                            ${respuestasUsuario.length}
                        </div>
                        <div style="font-size: 0.9em;">
                            <i class="fas fa-file-alt"></i> Total preguntas
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; text-align: center;">
                    <button onclick="descargarResultadosPremium()" class="action-btn" style="background: white; color: #764ba2; border: none;">
                        <i class="fas fa-download"></i> Descargar reporte completo
                    </button>
                </div>
            </div>
        `;
        detalleDiv.style.display = "block";
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar análisis premium';
            toggleBtn.style.background = "#e74c3c";
        }
    } else {
        detalleDiv.style.display = "none";
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Ver análisis detallado PREMIUM';
            toggleBtn.style.background = "#4CAF50";
        }
    }
}
/************ PUNTO 3: DESCARGAR RESULTADOS BÁSICOS ************/
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
Tiempo restante: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2,'0')}

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

¡Gracias por usar el simulador!
`;

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

/************ FUNCIONES PREMIUM ************/
function mostrarMensajePremium() {
    return `
        <div class="premium-box" style="
            border: 2px solid #FF9800;
            background: #FFF8E1;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
        ">
            <h3 style="color: #EF6C00; margin-top: 0;"><i class="fas fa-crown"></i> FUNCIONES PREMIUM BLOQUEADAS</h3>
            
            <p>Para desbloquear el análisis completo de tu examen:</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                <div style="background: white; padding: 15px; border-radius: 10px;">
                    <strong>✅ Lo que ves ahora (GRATIS):</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Nota final (${respuestasUsuario.filter(r => r.correcta).length}/${respuestasUsuario.length})</li>
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

/************ PUNTO 5: PANEL DE DONACIONES CON Bs ************/
function mostrarPanelDonaciones() {
    return `
        <div class="donacion-box" style="
            border: 2px solid #4CAF50;
            background: #f0fff4;
            padding: 20px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        ">
            <h3 style="color: #2E7D32; margin-top: 0;">
                <i class="fas fa-gift"></i> OBTÉN PREMIUM - Bs ${contactoDonaciones.montoPremium}.00
            </h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 25px; align-items: center; justify-content: center;">
                <div style="flex: 1; min-width: 250px;">
                    <h4><i class="fas fa-qrcode"></i> VÍA YAPE:</h4>
                    <div style="background: white; padding: 15px; border-radius: 10px; display: inline-block; margin: 10px 0;">
                        <img src="${contactoDonaciones.yapeQR}" 
                             alt="QR Yape" 
                             style="width: 200px; height: 200px; border: 2px solid #ddd; border-radius: 10px;">
                    </div>
                    <p><strong>Monto:</strong> Bs ${contactoDonaciones.montoPremium}.00</p>
                </div>
                
                <div style="flex: 1; min-width: 250px; text-align: left;">
                    <h4><i class="fas fa-list-ol"></i> PASOS PARA ACTIVAR PREMIUM:</h4>
                    <ol style="padding-left: 20px;">
                        <li>Paga <strong>Bs ${contactoDonaciones.montoPremium}.00</strong> por Yape</li>
                        <li>Toma captura del comprobante</li>
                        <li>Envíalo al WhatsApp:
                            <br><a href="https://wa.me/${contactoDonaciones.celular}" target="_blank" style="color: #25D366; font-weight: bold;">
                                ${contactoDonaciones.celular}
                            </a>
                        </li>
                        <li>Indica tu correo:
                            <br><em>(el que usarás en el examen)</em>
                        </li>
                        <li>Te activaremos en < 24 horas</li>
                    </ol>
                    
                    <div style="margin-top: 20px;">
                        <a href="https://wa.me/${contactoDonaciones.celular}?text=Hola%2C%20quiero%20activar%20Premium%20por%20Bs%20${contactoDonaciones.montoPremium}" 
                           target="_blank"
                           style="display: inline-block; background: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 10px 0;">
                           <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                <i class="fas fa-info-circle"></i> <em>Tu apoyo mantiene vivo este proyecto educativo. ¡Gracias!</em>
            </p>
        </div>
    `;
}

function mostrarAgradecimientoPremium() {
    return `
        <div style="
            border: 3px solid #9C27B0;
            background: #F3E5F5;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
            text-align: center;
        ">
            <h3 style="color: #7B1FA2; margin-top: 0;"><i class="fas fa-star"></i> ¡GRACIAS POR SER PREMIUM!</h3>
            <p>Tu acceso está activo. Si deseas apoyar adicionalmente el proyecto o compartir con un amigo:</p>
            
            <div style="margin: 20px 0;">
                ${mostrarPanelDonaciones()}
            </div>
        </div>
    `;
}

/************ REINICIAR EXAMEN COMPLETO ************/
function reiniciarExamenCompleto() {
    // Reiniciar todas las variables
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

    // Resetear timer display
    timer.textContent = "Tiempo: 120:00";
    timer.style.color = "white";
    timer.style.animation = "none";

    // Resetear botón de inicio
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar Examen';

    // Ocultar exam container
    examContainer.style.display = "none";
}

/************ DESCARGAR RESULTADOS PREMIUM ************/
function descargarResultadosPremium() {
    let correctasTotales = respuestasUsuario.filter(r => r.correcta).length;
    let totalPreguntas = respuestasUsuario.length;
    let notaFinal = totalPreguntas > 0 ? (correctasTotales / totalPreguntas * 100).toFixed(2) : "0.00";

    let contenido = `
EXAMEN SIMULADOR - REPORTE PREMIUM COMPLETO
===========================================
Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
Nota Final: ${notaFinal}/100
Correctas: ${correctasTotales} de ${totalPreguntas}
Tiempo restante: ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}
Versión: PREMIUM (acceso completo)

RESULTADOS POR SECCIÓN:
`;

    // Calcular resultados por sección
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
  Efectividad: ${porcentaje >= 70 ? "ALTA" : porcentaje >= 50 ? "MEDIA" : "BAJA"}
`;
    });

    contenido += `

DETALLE COMPLETO DE RESPUESTAS:
`;

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
   ${!esCorrecta ? `Recomendación: Revisar tema de ${r.subcategoria || r.materia || "esta área"}` : ''}
`;
    });

    contenido += `

ESTADÍSTICAS AVANZADAS:
======================
Total preguntas: ${totalPreguntas}
Preguntas correctas: ${correctasTotales} (${((correctasTotales / totalPreguntas) * 100).toFixed(1)}%)
Preguntas incorrectas: ${totalPreguntas - correctasTotales} (${(((totalPreguntas - correctasTotales) / totalPreguntas) * 100).toFixed(1)}%)

RECOMENDACIONES:
`;

    // Recomendaciones por sección
    Object.keys(secciones).forEach(sec => {
        const porcentaje = ((secciones[sec].correctas / secciones[sec].total) * 100).toFixed(1);
        let recomendacion = "";
        if (porcentaje < 50) {
            recomendacion = "Necesita estudio intensivo";
        } else if (porcentaje < 70) {
            recomendacion = "Requiere práctica moderada";
        } else if (porcentaje < 85) {
            recomendacion = "Buen desempeño, puede mejorar";
        } else {
            recomendacion = "Excelente desempeño";
        }

        contenido += `
- ${sec}: ${porcentaje}% - ${recomendacion}
`;
    });

    // Crear y descargar archivo
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


