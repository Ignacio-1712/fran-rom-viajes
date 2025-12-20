/************************************
 * CONFIGURACIÓN GENERAL
 ************************************/

const WhatsAppConfig = {
    numeros: ["5491132587520", "5491166099970"],
    mensajeBase: "Hola Fran & Rom, me interesa obtener más información sobre el viaje a: ",
    mensajeDefault: "Hola Fran & Rom, me interesa obtener más información sobre sus servicios de viajes."
};

/************************************
 * CONFIGURACIÓN BACKEND HOSTINGER
 ************************************/
const BACKEND_URL = 'https://darkgreen-rook-662013.hostingersite.com/api-comentarios.php';

/************************************
 * WHATSAPP + MODAL
 ************************************/

let destinoSeleccionado = "";

function enviarWhatsAppDestino(destino) {
    const mensaje = encodeURIComponent(`${WhatsAppConfig.mensajeBase}${destino}`);
    const numero = WhatsAppConfig.numeros[Math.floor(Math.random() * WhatsAppConfig.numeros.length)];
    window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
}

function mostrarModalReserva(destino) {
    destinoSeleccionado = destino;
    const modal = document.getElementById("reservaModal");
    const modalDestino = document.getElementById("modalDestino");
    modalDestino.textContent = `¿Deseas contactarnos para reservar en ${destino}?`;
    modal.classList.add("mostrar");
    document.body.style.overflow = "hidden";
}

function cerrarModal() {
    document.getElementById("reservaModal").classList.remove("mostrar");
    document.body.style.overflow = "";
    destinoSeleccionado = "";
}

function confirmarReserva() {
    destinoSeleccionado
        ? enviarWhatsAppDestino(destinoSeleccionado)
        : enviarWhatsAppDestino("");
    cerrarModal();
}

/************************************
 * FUNCIONES PARA COMENTARIOS
 ************************************/

async function enviarComentarioBackend(data) {
    try {
        console.log('Enviando comentario a:', BACKEND_URL);
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Respuesta HTTP:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: ${errorText.substring(0, 100)}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error en enviarComentarioBackend:', error);
        throw error;
    }
}

async function obtenerComentariosBackend() {
    try {
        console.log('Obteniendo comentarios de:', BACKEND_URL);
        const response = await fetch(BACKEND_URL);
        
        console.log('Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al cargar comentarios`);
        }
        
        const data = await response.json();
        console.log('Comentarios recibidos:', data.length || 0);
        
        return Array.isArray(data) ? data : [];
        
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        // Datos de ejemplo si falla
        return [
            {
                id: 1,
                nombre: "Carlos López",
                comentario: "Excelente servicio, muy puntuales y cómodo",
                valoracion: 5,
                sentimiento: "POSITIVO",
                fecha: new Date().toISOString()
            },
            {
                id: 2,
                nombre: "Ana Martínez",
                comentario: "Muy buen viaje, volveré a viajar con Fran & Rom",
                valoracion: 4,
                sentimiento: "POSITIVO",
                fecha: new Date().toISOString()
            }
        ];
    }
}

/************************************
 * INICIALIZAR COMENTARIOS
 ************************************/

function inicializarComentarios() {
    const form = document.getElementById("formComentario");
    const lista = document.getElementById("lista-comentarios");

    if (!form) {
        console.warn('No se encontró el formulario de comentarios');
        return;
    }

    console.log('Inicializando sistema de comentarios...');
    cargarComentarios();

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const nombre = form.nombre.value.trim();
        const comentario = form.comentario.value.trim();
        const valoracion = parseInt(form.valoracion.value);

        if (!nombre || !comentario || !valoracion) {
            alert("Por favor completa todos los campos");
            return;
        }

        const boton = form.querySelector('button[type="submit"]');
        const textoOriginal = boton.innerHTML;
        
        try {
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            boton.disabled = true;

            const resultado = await enviarComentarioBackend({
                nombre,
                comentario,
                valoracion
            });

            alert(`✅ Comentario enviado exitosamente`);
            form.reset();
            cargarComentarios();
            
        } catch (error) {
            console.error('Error enviando comentario:', error);
            alert('Error al enviar comentario. Por favor intenta nuevamente.');
        } finally {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    });

    async function cargarComentarios() {
        const lista = document.getElementById("lista-comentarios");
        if (!lista) {
            console.error('No se encontró el contenedor de comentarios');
            return;
        }
        
        lista.innerHTML = '<div class="cargando"><i class="fas fa-spinner fa-spin"></i> Cargando comentarios...</div>';
        
        try {
            const comentarios = await obtenerComentariosBackend();
            mostrarComentarios(comentarios);
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            lista.innerHTML = `
                <div class="error-comentario">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error cargando comentarios. Intenta recargar la página.
                </div>
            `;
        }
    }
    
    function mostrarComentarios(comentarios) {
        const lista = document.getElementById("lista-comentarios");
        if (!lista) return;
        
        if (!comentarios || comentarios.length === 0) {
            lista.innerHTML = `
                <div class="sin-comentarios">
                    <i class="far fa-comment"></i>
                    <p>No hay comentarios aún.<br>Sé el primero en compartir tu experiencia.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        comentarios.forEach(c => {
            const fecha = c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) : 'Fecha reciente';
            
            const estrellas = '⭐'.repeat(c.valoracion) + '☆'.repeat(5 - c.valoracion);
            
            // Determinar clase según sentimiento
            let clase = '';
            let badge = '';
            
            if (c.sentimiento === 'POSITIVO' || c.sentimiento === 'POS') {
                clase = 'comentario-bueno';
                badge = '<span class="badge bueno">👍 Positivo</span>';
            } else if (c.sentimiento === 'NEGATIVO' || c.sentimiento === 'NEG') {
                clase = 'comentario-malo';
                badge = '<span class="badge malo">👎 Crítico</span>';
            } else {
                clase = '';
                badge = '<span class="badge">➖ Neutral</span>';
            }
            
            html += `
                <div class="comentario-card ${clase}">
                    <div class="comentario-header">
                        <div class="comentario-autor">
                            <i class="fas fa-user-circle"></i>
                            <strong>${c.nombre}</strong>
                        </div>
                        <div class="comentario-fecha">
                            <i class="far fa-calendar"></i> ${fecha}
                        </div>
                    </div>
                    <div class="comentario-estrellas">
                        ${estrellas}
                        <span class="valoracion-num">${c.valoracion}/5</span>
                    </div>
                    <div class="comentario-texto">
                        <i class="fas fa-quote-left"></i>
                        ${c.comentario}
                        <i class="fas fa-quote-right"></i>
                    </div>
                    <div class="comentario-footer">
                        ${badge}
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    }
}

/************************************
 * MENÚ MÓVIL CORREGIDO
 ************************************/

function inicializarMenuMovil() {
    // Usa el ID CORRECTO de tu botón
    const btn = document.getElementById("menuMobileBtn"); // ← Cambié a menuMobileBtn
    const menu = document.querySelector(".menu");

    if (!btn || !menu) {
        console.warn('No se encontraron elementos del menú móvil');
        return;
    }

    console.log('Inicializando menú móvil...');
    
    btn.addEventListener("click", () => {
        menu.classList.toggle("activo");
        document.body.style.overflow = menu.classList.contains("activo") ? "hidden" : "";
        btn.innerHTML = menu.classList.contains("activo")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll(".nav-link").forEach(link =>
        link.addEventListener("click", () => {
            menu.classList.remove("activo");
            btn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = "";
        })
    );
}

/************************************
 * INICIALIZACIÓN COMPLETA
 ************************************/

document.addEventListener("DOMContentLoaded", () => {
    console.log('=== FRAN & ROM - Inicializando ===');
    
    // 1. Botones de reserva WhatsApp
    document.querySelectorAll('.btn-reservar').forEach(button => {
        button.addEventListener('click', function() {
            const destino = this.getAttribute('data-destino');
            if (destino) {
                mostrarModalReserva(destino);
            }
        });
    });
    
    // 2. Modal de confirmación
    const modalConfirmar = document.getElementById('modalConfirmar');
    const modalCerrar = document.getElementById('modalCerrar');
    const modalCancelar = document.getElementById('modalCancelar');
    
    if (modalConfirmar) modalConfirmar.addEventListener('click', confirmarReserva);
    if (modalCerrar) modalCerrar.addEventListener('click', cerrarModal);
    if (modalCancelar) modalCancelar.addEventListener('click', cerrarModal);
    
    // 3. Menú móvil
    inicializarMenuMovil();
    
    // 4. Sistema de comentarios
    inicializarComentarios();
    
    // 5. Botón "Volver arriba"
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('visible', window.scrollY > 300);
        });
        
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    console.log('=== Inicialización completada ===');
});

/************************************
 * ESTILOS PARA COMENTARIOS (se inyectan automáticamente)
 ************************************/

document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para comentarios */
        .comentarios-lista {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin-top: 30px;
        }
        
        .comentario-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        
        .comentario-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.12);
        }
        
        .comentario-bueno {
            border-left: 5px solid #4CAF50;
            background: linear-gradient(135deg, #f0fff0 0%, #ffffff 100%);
        }
        
        .comentario-malo {
            border-left: 5px solid #f44336;
            background: linear-gradient(135deg, #fff0f0 0%, #ffffff 100%);
        }
        
        .comentario-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .comentario-autor {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .comentario-autor i {
            color: #3498db;
            font-size: 1.2em;
        }
        
        .comentario-fecha {
            color: #7f8c8d;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .comentario-estrellas {
            font-size: 1.5em;
            color: #FFD700;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .valoracion-num {
            font-size: 0.9em;
            color: #666;
            background: #f8f9fa;
            padding: 4px 10px;
            border-radius: 20px;
        }
        
        .comentario-texto {
            line-height: 1.6;
            color: #2c3e50;
            padding: 20px;
            background: rgba(255,255,255,0.9);
            border-radius: 8px;
            margin: 15px 0;
            font-style: italic;
            position: relative;
        }
        
        .comentario-texto i.fa-quote-left {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #3498db;
            opacity: 0.3;
        }
        
        .comentario-texto i.fa-quote-right {
            position: absolute;
            bottom: 10px;
            right: 10px;
            color: #3498db;
            opacity: 0.3;
        }
        
        .comentario-footer {
            text-align: right;
            margin-top: 15px;
        }
        
        .badge {
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .badge.bueno {
            background: #d4edda;
            color: #155724;
        }
        
        .badge.malo {
            background: #f8d7da;
            color: #721c24;
        }
        
        .badge:not(.bueno):not(.malo) {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .cargando, .sin-comentarios, .error-comentario {
            text-align: center;
            padding: 50px 30px;
            grid-column: 1 / -1;
            color: #666;
            font-size: 1.1em;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px dashed #dee2e6;
        }
        
        .cargando i {
            margin-right: 15px;
            color: #3498db;
        }
        
        .sin-comentarios i {
            font-size: 3em;
            color: #3498db;
            margin-bottom: 20px;
            display: block;
        }
        
        .error-comentario i {
            color: #e74c3c;
            margin-right: 10px;
        }
        
        /* Formulario */
        .comentarios-form {
            max-width: 600px;
            margin: 0 auto 40px;
        }
        
        .comentarios-form input,
        .comentarios-form select,
        .comentarios-form textarea {
            width: 100%;
            padding: 15px;
            margin: 12px 0;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 16px;
        }
        
        .comentarios-form textarea {
            min-height: 150px;
            resize: vertical;
        }
        
        @media (max-width: 768px) {
            .comentarios-lista {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});