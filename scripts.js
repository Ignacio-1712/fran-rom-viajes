/************************************
 * CONFIGURACIÓN GENERAL
 ************************************/

const WhatsAppConfig = {
    numeros: ["5491132587520", "5491166099970"],
    mensajeBase: "Hola Fran & Rom, me interesa obtener más información sobre el viaje a: ",
    mensajeDefault: "Hola Fran & Rom, me interesa obtener más información sobre sus servicios de viajes."
};

// ===== ELIMINAR ESTAS LÍNEAS =====
// const SUPABASE_URL = "https://TU_PROYECTO.supabase.cohttps://vuqrdulufxvvufhlsxqx.supabase.co";
// const SUPABASE_ANON_KEY = "sb_publishable_hDJqmkRa4pTk-CXnnY61tA__6Y6HGYM";
// const HF_API_URL = "https://api-inference.huggingface.co/models/pysentimiento/robertuito-sentiment-analysis";
// const HF_API_KEY = "";
// ==================================

/************************************
 * CONFIGURACIÓN BACKEND (NUEVO)
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
 * FUNCIONES PARA COMENTARIOS (BACKEND)
 ************************************/

async function enviarComentarioBackend(data) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Error del servidor');
    }
    
    return await response.json();
}

async function obtenerComentariosBackend() {
    const response = await fetch(BACKEND_URL);
    
    if (!response.ok) {
        throw new Error('Error cargando comentarios');
    }
    
    return await response.json();
}

/************************************
 * INICIALIZAR COMENTARIOS (MODIFICADO)
 ************************************/

function inicializarComentarios() {
    const form = document.getElementById("formComentario");
    const lista = document.getElementById("lista-comentarios"); // ← CAMBIÉ "listaComentarios" a "lista-comentarios"

    if (!form) return;

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

        try {
            const resultado = await enviarComentarioBackend({
                nombre,
                comentario,
                valoracion
            });

            alert(`✅ Comentario enviado. Análisis: ${resultado.sentimiento}`);
            form.reset();
            cargarComentarios();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar comentario. Intenta nuevamente.');
        }
    });

    async function cargarComentarios() {
        try {
            lista.innerHTML = '<div class="cargando"><i class="fas fa-spinner fa-spin"></i> Cargando comentarios...</div>';
            const comentarios = await obtenerComentariosBackend();
            
            mostrarComentarios(comentarios);
            
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            lista.innerHTML = '<div class="error-comentario"><i class="fas fa-exclamation-triangle"></i> Error cargando comentarios</div>';
        }
    }
    
    function mostrarComentarios(comentarios) {
        // Esta función debe coincidir con el código de tu index.html
        // Si no funciona, dime y te la completo
        const contenedor = document.getElementById("lista-comentarios");
        if (!comentarios || comentarios.length === 0) {
            contenedor.innerHTML = '<div class="sin-comentarios">No hay comentarios aún</div>';
            return;
        }
        
        let html = '';
        comentarios.forEach(c => {
            html += `
                <div class="comentario-card ${c.sentimiento === 'POS' ? 'comentario-bueno' : 'comentario-malo'}">
                    <h4>${c.nombre}</h4>
                    <p>${c.comentario}</p>
                    <span>⭐ ${c.valoracion}/5 | ${c.sentimiento}</span>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    }
}

/************************************
 * MENÚ MÓVIL
 ************************************/

function inicializarMenuMovil() {
    const btn = document.getElementById("menuMobile");
    const menu = document.querySelector(".menu");

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
 * RESERVAS CON DESTINO
 ************************************/

// Agregar event listeners a los botones de reserva
document.addEventListener('DOMContentLoaded', function() {
    // Botones de reserva para WhatsApp
    document.querySelectorAll('.btn-reservar').forEach(button => {
        button.addEventListener('click', function() {
            const destino = this.getAttribute('data-destino');
            mostrarModalReserva(destino);
        });
    });
    
    // Modal buttons
    document.getElementById('modalConfirmar')?.addEventListener('click', confirmarReserva);
    document.getElementById('modalCerrar')?.addEventListener('click', cerrarModal);
    document.getElementById('modalCancelar')?.addEventListener('click', cerrarModal);
    
    // Inicializar otras funciones
    inicializarMenuMovil();
    inicializarComentarios();
});

/************************************
 * BOTÓN FLOTANTE (Back to Top)
 ************************************/

window.addEventListener('scroll', function() {
    const backBtn = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        backBtn?.classList.add('visible');
    } else {
        backBtn?.classList.remove('visible');
    }
});

document.getElementById('backToTop')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});