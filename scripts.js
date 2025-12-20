/************************************
 * CONFIGURACIÓN GENERAL
 ************************************/

const WhatsAppConfig = {
    numeros: ["5491132587520", "5491166099970"],
    mensajeBase: "Hola Fran & Rom, me interesa obtener más información sobre el viaje a: ",
    mensajeDefault: "Hola Fran & Rom, me interesa obtener más información sobre sus servicios de viajes."
};

const SUPABASE_URL = "https://TU_PROYECTO.supabase.cohttps://vuqrdulufxvvufhlsxqx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hDJqmkRa4pTk-CXnnY61tA__6Y6HGYM";


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
 * CONFIGURACIÓN BACKEND
 ************************************/
const BACKEND_URL = 'https://darkgreen-rook-662013.hostingersite.com/api-comentarios.php';

/************************************
 * FUNCIONES PARA COMENTARIOS
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
    const lista = document.getElementById("listaComentarios");

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
            // Enviar al backend PHP (que llama a Hugging Face y Supabase)
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
            
            // Mostrar comentarios (mismo código que ya tienes)
            mostrarComentarios(comentarios);
            
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            lista.innerHTML = '<div class="error-comentario"><i class="fas fa-exclamation-triangle"></i> Error cargando comentarios</div>';
        }
    }
    
    function mostrarComentarios(comentarios) {
        // TU CÓDIGO ACTUAL PARA MOSTRAR COMENTARIOS
        // Se mantiene igual
    }
}

/************************************
 * MENÚ MÓVIL (UNIFICADO)
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
 * INIT
 ************************************/

document.addEventListener("DOMContentLoaded", () => {
    inicializarMenuMovil();
    inicializarComentarios();
});
