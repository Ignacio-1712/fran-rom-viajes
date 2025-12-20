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

const HF_API_URL =
  "https://api-inference.huggingface.co/models/pysentimiento/robertuito-sentiment-analysis";
const HF_API_KEY = "";


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
 * SUPABASE
 ************************************/

async function insertarComentarioSupabase(data) {
    await fetch(`${SUPABASE_URL}/rest/v1/comentarios`, {
        method: "POST",
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
        },
        body: JSON.stringify(data)
    });
}

async function obtenerComentariosSupabase() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comentarios?select=nombre,comentario,valoracion,fecha&order=fecha.desc`,
        {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    return res.json();
}


/************************************
 * HUGGING FACE
 ************************************/

async function clasificarComentarioHF(texto) {
    const res = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: texto })
    });
    const data = await res.json();
    return data?.[0]?.label || "NEUTRAL";
}


/************************************
 * COMENTARIOS (FORMULARIO)
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

        const sentimiento = await clasificarComentarioHF(comentario);

        await insertarComentarioSupabase({
            nombre,
            comentario,
            valoracion,
            sentimiento
        });

        form.reset();
        cargarComentarios();
    });

    async function cargarComentarios() {
        lista.innerHTML = "";
        const comentarios = await obtenerComentariosSupabase();

        comentarios.forEach(c => {
            const div = document.createElement("div");
            div.className = "comentario";
            div.innerHTML = `
                <h4>${c.nombre}</h4>
                <p>${c.comentario}</p>
                <span>⭐ ${c.valoracion}</span>
            `;
            lista.appendChild(div);
        });
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
