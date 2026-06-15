// Funcionalidad para animaciones al hacer scroll
document.addEventListener('DOMContentLoaded', function() {
    // Animación de elementos al hacer scroll
    observarElementos();
    
    // Cerrar menu en mobile
    configurarMenu();
});

// Observar elementos para animar
function observarElementos() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar cards
    document.querySelectorAll('.feature-card, .consensus-card, .proyecto-card, .contacto-item').forEach(el => {
        observer.observe(el);
    });
}

// Configurar menú mobile
function configurarMenu() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Smooth scroll ya está habilitado en HTML
        });
    });
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .timeline-item {
        animation: fadeInUp 0.6s ease backwards;
    }

    .timeline-item:nth-child(1) { animation-delay: 0.1s; }
    .timeline-item:nth-child(2) { animation-delay: 0.2s; }
    .timeline-item:nth-child(3) { animation-delay: 0.3s; }
    .timeline-item:nth-child(4) { animation-delay: 0.4s; }
`;
document.head.appendChild(style);

// Función para scroll suave adicional
function smoothScroll(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Agregar event listener para todos los links
document.addEventListener('click', smoothScroll);

// Efectos de hover en cards
document.querySelectorAll('.feature-card, .consensus-card, .proyecto-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

console.log('Website cargada correctamente ✅');
