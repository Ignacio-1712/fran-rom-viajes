// ===== CONFIGURACIÓN =====
const WhatsAppConfig = {
    numeros: [
        "5491132587520",
        "5491166099970"
    ],
    mensajeBase: "Hola Fran & Rom, me interesa obtener más información sobre el viaje a: ",
    mensajeDefault: "Hola Fran & Rom, me interesa obtener más información sobre sus servicios de viajes."
};

// ===== VARIABLES GLOBALES =====
let destinoSeleccionado = "";

// ===== FUNCIONES PRINCIPALES =====
function enviarWhatsAppDestino(destino) {
    const mensaje = encodeURIComponent(`${WhatsAppConfig.mensajeBase}${destino}`);
    const numeroAleatorio = WhatsAppConfig.numeros[Math.floor(Math.random() * WhatsAppConfig.numeros.length)];
    const urlWhatsApp = `https://wa.me/${numeroAleatorio}?text=${mensaje}`;
    
    window.open(urlWhatsApp, '_blank');
}

function mostrarModalReserva(destino) {
    destinoSeleccionado = destino;
    const modal = document.getElementById('reservaModal');
    const modalDestino = document.getElementById('modalDestino');
    
    if (modal && modalDestino) {
        modalDestino.textContent = `¿Deseas contactarnos para reservar en ${destino}?`;
        modal.classList.add('mostrar');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal() {
    const modal = document.getElementById('reservaModal');
    if (modal) {
        modal.classList.remove('mostrar');
        document.body.style.overflow = 'auto';
        destinoSeleccionado = "";
    }
}

function confirmarReserva() {
    if (destinoSeleccionado) {
        enviarWhatsAppDestino(destinoSeleccionado);
    } else {
        const mensaje = encodeURIComponent(WhatsAppConfig.mensajeDefault);
        const numeroAleatorio = WhatsAppConfig.numeros[Math.floor(Math.random() * WhatsAppConfig.numeros.length)];
        const urlWhatsApp = `https://wa.me/${numeroAleatorio}?text=${mensaje}`;
        window.open(urlWhatsApp, '_blank');
    }
    cerrarModal();
}

// ===== FUNCIONALIDAD DE BOTONES DE RESERVA =====
function inicializarBotonesReserva() {
    const botonesReserva = document.querySelectorAll('.btn-reservar');
    
    botonesReserva.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            const destino = this.getAttribute('data-destino');
            if (destino) {
                mostrarModalReserva(destino);
            }
        });
    });
}

// ===== BOTÓN VOLVER ARRIBA =====
function inicializarBotonArriba() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
    }
}

// ===== MENÚ MÓVIL =====
function inicializarMenuMovil() {
    const menuMobileBtn = document.getElementById('menuMobile');
    const menu = document.querySelector('.menu');
    
    if (menuMobileBtn && menu) {
        menuMobileBtn.addEventListener('click', function() {
            menu.classList.toggle('activo');
            this.innerHTML = menu.classList.contains('activo') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('activo');
                menuMobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && !menuMobileBtn.contains(e.target) && menu.classList.contains('activo')) {
                menu.classList.remove('activo');
                menuMobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// ===== MEJORAR EXPERIENCIA MÓVIL =====
function mejorarExperienciaMovil() {
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Agregar clase para estilos específicos
        document.body.classList.add('mobile-device');
        
        // Mejorar clics en móviles
        document.addEventListener('touchstart', function() {}, {passive: true});
    }
}

// ===== ANIMACIONES DE SCROLL =====
function inicializarAnimacionesScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observar todas las secciones
    document.querySelectorAll('.seccion').forEach(section => {
        observer.observe(section);
    });
}

// ===== FUNCIONALIDAD DEL MODAL =====
function inicializarModal() {
    const modal = document.getElementById('reservaModal');
    const modalCerrar = document.getElementById('modalCerrar');
    const modalCancelar = document.getElementById('modalCancelar');
    const modalConfirmar = document.getElementById('modalConfirmar');
    
    // Cerrar modal con botones
    if (modalCerrar) modalCerrar.addEventListener('click', cerrarModal);
    if (modalCancelar) modalCancelar.addEventListener('click', cerrarModal);
    if (modalConfirmar) modalConfirmar.addEventListener('click', confirmarReserva);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('mostrar')) {
            cerrarModal();
        }
    });
}

// ===== CONTADOR DE VISITAS (OPCIONAL) =====
function inicializarContadorVisitas() {
    if (localStorage.getItem('visitCount')) {
        let count = parseInt(localStorage.getItem('visitCount'));
        count++;
        localStorage.setItem('visitCount', count);
    } else {
        localStorage.setItem('visitCount', 1);
    }
    
    // Solo para depuración
    console.log(`Visitas a la página: ${localStorage.getItem('visitCount')}`);
}
    
    function tipoComentario(valoracion) {
        return valoracion >= 4 ? "bueno" : "malo";
    }
     
        const nombreInput = document.getElementById('nombre');
        const comentarioInput = document.getElementById('comentario');
        const valoracionSelect = document.getElementById('valoracion');
        
        const nombre = nombreInput.value.trim();
        const comentario = comentarioInput.value.trim();
        const valoracion = parseInt(valoracionSelect.value);
        
        if (!nombre || !comentario || !valoracion) {
            alert("Por favor completa todos los campos");
            return;
        }
        
        if (contieneLenguajeOfensivo(comentario)) {
            alert("⚠️ Tu comentario contiene lenguaje ofensivo y no puede ser publicado.");
            return;
        }

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fran & Rom - Sistema cargado correctamente');
    
    // Inicializar todas las funcionalidades
    inicializarBotonesReserva();
    inicializarBotonArriba();
    inicializarMenuMovil();
    mejorarExperienciaMovil();
    inicializarAnimacionesScroll();
    inicializarModal();
    inicializarContadorVisitas();
    
    // Efecto de carga
    setTimeout(() => {
        document.body.classList.add('cargado');
    }, 100);
});

// ===== FUNCIONES GLOBALES =====
window.FranRom = {
    enviarWhatsAppDestino,
    mostrarModalReserva,
    cerrarModal,
    confirmarReserva
};

// ===== DETECCIÓN DE OFFLINE =====
window.addEventListener('online', function() {
    console.log('Conexión restablecida');
});

window.addEventListener('offline', function() {
    console.log('Sin conexión a internet');
    alert('⚠️ Parece que perdiste la conexión a internet. Algunas funciones pueden no estar disponibles.');
});

// ===== COMPROBACIÓN DE IMÁGENES FALTANTES =====
window.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Imagen no encontrada: ${this.src}`);
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="55" font-family="Arial" font-size="10" text-anchor="middle" fill="%23999">Imagen no disponible</text></svg>';
        });
    });
});