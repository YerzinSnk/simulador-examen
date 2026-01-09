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

/************ FINALIZAR EXAMEN ************/
function finishExam() {
    clearInterval(timerInterval);
    
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

    examContainer.innerHTML = `
        <div class="results-summary">
            <h2><i class="fas fa-trophy"></i> ¡Examen Finalizado!</h2>
            <div class="final-score" style="color: ${notaColor};">${notaFinal}</div>
            <p style="font-size: 1.2rem; margin-bottom: 10px;">Nota Final / 100</p>
            <p><strong>${correctasTotales}</strong> respuestas correctas de <strong>${totalPreguntas}</strong> preguntas</p>
            <p style="margin-top: 10px;"><i class="fas fa-clock"></i> Tiempo restante: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2,'0')}</p>
        </div>

        <h3 style="text-align: center; margin: 40px 0 20px; color: #2c3e50;">
            <i class="fas fa-chart-bar"></i> Resultados por Sección
        </h3>
        
        <div class="section-stats">
            ${Object.keys(secciones).map(sec => {
                const porcentaje = ((secciones[sec].correctas / secciones[sec].total) * 100).toFixed(1);
                let colorBarra = "#e74c3c";
                if (porcentaje >= 60) colorBarra = "#f39c12";
                if (porcentaje >= 70) colorBarra = "#3498db";
                if (porcentaje >= 80) colorBarra = "#2ecc71";
                
                return `
                <div class="stat-card">
                    <h3>${sec}</h3>
                    <div class="score">${secciones[sec].correctas}/${secciones[sec].total}</div>
                    <div class="percentage">${porcentaje}% de acierto</div>
                    <div class="progress-bar" style="margin-top: 15px; height: 8px;">
                        <div class="progress-fill" style="width: ${porcentaje}%; background: ${colorBarra}"></div>
                    </div>
                </div>
                `;
            }).join("")}
        </div>

        <button onclick="mostrarDetalleRespuestas()" class="details-toggle" id="toggleDetails">
            <i class="fas fa-eye"></i> Ver detalle de respuestas
        </button>
        
        <div id="detalleRespuestas" style="display: none;"></div>
        
        <div class="action-buttons">
            <button onclick="reiniciarExamenCompleto()" class="action-btn restart-btn">
                <i class="fas fa-redo"></i> Reiniciar Examen
            </button>
            <button onclick="descargarResultados()" class="action-btn download-btn">
                <i class="fas fa-download"></i> Descargar Resultados
            </button>
        </div>
    `;
}

/************ MOSTRAR DETALLE DE RESPUESTAS ************/
function mostrarDetalleRespuestas() {
    const detalleDiv = document.getElementById("detalleRespuestas");
    const toggleBtn = document.getElementById("toggleDetails");
    
    if (detalleDiv.style.display === "none") {
        detalleDiv.innerHTML = `
            <h3 style="text-align: center; margin: 40px 0 20px; color: #2c3e50;">
                <i class="fas fa-list-check"></i> Detalle de Respuestas (${respuestasUsuario.length} preguntas)
            </h3>
            <div class="details-container">
                ${respuestasUsuario.map((r, index) => {
                    const textoSeleccionado = r.opciones && r.opciones[r.seleccion] ? 
                        r.opciones[r.seleccion] : "No registrada";
                    const opcionCorrecta = r.opciones ? 
                        r.opciones[r.indiceCorrectoOriginal] || "No encontrada" : "No disponible";
                    const esCorrecta = r.correcta;
                    
                    return `
                    <div class="answer-item ${esCorrecta ? 'correct' : 'incorrect'}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="font-size: 1.1rem;">Pregunta ${index + 1}: ${r.categoria}</strong>
                            <span style="font-weight: bold; color: ${esCorrecta ? '#27ae60' : '#c0392b'}">
                                ${esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}
                            </span>
                        </div>
                        <p><strong>Área:</strong> ${r.subcategoria || r.materia || "Sin categoría"}</p>
                        <p><strong>Enunciado:</strong> ${r.pregunta || "Sin texto"}</p>
                        <p style="margin-top: 10px;"><strong>Tu respuesta:</strong> ${textoSeleccionado}</p>
                        ${!esCorrecta ? `<p style="margin-top: 5px;"><strong>Respuesta correcta:</strong> ${opcionCorrecta}</p>` : ''}
                    </div>
                    `;
                }).join("")}
            </div>
        `;
        detalleDiv.style.display = "block";
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar detalle de respuestas';
        toggleBtn.style.background = "#667eea";
        toggleBtn.style.color = "white";
    } else {
        detalleDiv.style.display = "none";
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Ver detalle de respuestas';
        toggleBtn.style.background = "transparent";
        toggleBtn.style.color = "#667eea";
    }
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

/************ DESCARGAR RESULTADOS ************/
function descargarResultados() {
    let correctasTotales = respuestasUsuario.filter(r => r.correcta).length;
    let totalPreguntas = respuestasUsuario.length;
    let notaFinal = totalPreguntas > 0 ? (correctasTotales / totalPreguntas * 100).toFixed(2) : "0.00";
    
    let contenido = `
SIMULADOR DE EXAMEN - RESULTADOS
================================
Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
Nota Final: ${notaFinal}/100
Correctas: ${correctasTotales} de ${totalPreguntas}
Tiempo restante: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2,'0')}

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
        contenido += `
${sec}:
  Correctas: ${secciones[sec].correctas} de ${secciones[sec].total}
  Porcentaje: ${porcentaje}%
`;
    });
    
    contenido += `

DETALLE DE RESPUESTAS:
`;
    
    respuestasUsuario.forEach((r, index) => {
        const textoSeleccionado = r.opciones && r.opciones[r.seleccion] ? 
            r.opciones[r.seleccion] : "No registrada";
        const opcionCorrecta = r.opciones ? 
            r.opciones[r.indiceCorrectoOriginal] || "No encontrada" : "No disponible";
        const esCorrecta = r.correcta;
        
        contenido += `
${index + 1}. ${r.categoria} - ${r.subcategoria || ""}
   Estado: ${esCorrecta ? "CORRECTA" : "INCORRECTA"}
   Tu respuesta: ${textoSeleccionado}
   ${!esCorrecta ? `Respuesta correcta: ${opcionCorrecta}` : ''}
`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_examen_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("Resultados descargados correctamente");
}