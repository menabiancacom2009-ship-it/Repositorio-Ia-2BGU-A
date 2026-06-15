// ===============================
// DATOS Y CONFIGURACIÓN
// ===============================

const REPO_OWNER = 'menabiancacom2009-ship-it';
const REPO_NAME = 'Repositorio-Ia-2BGU-A';
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Base de datos local para valoraciones
let ratingsDatabase = JSON.parse(localStorage.getItem('fileRatings')) || {};
let currentFile = null;

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    loadRepositoryFiles();
    setupEventListeners();
    updateStatistics();
});

// ===============================
// CARGAR ARCHIVOS DEL REPOSITORIO
// ===============================

async function loadRepositoryFiles() {
    try {
        showToast('Cargando archivos...', 'info');
        const response = await fetch(`${GITHUB_API}/contents`, {
            headers: {
                'Accept': 'application/vnd.github.v3+raw'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar los archivos');
        }

        const files = await response.json();
        displayFiles(files);
        showToast('Archivos cargados exitosamente ✅', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar los archivos. Usando datos de demostración.', 'error');
        loadDemoFiles();
    }
}

// ===============================
// MOSTRAR ARCHIVOS EN GRID
// ===============================

function displayFiles(files) {
    const filesGrid = document.getElementById('filesGrid');
    filesGrid.innerHTML = '';

    if (!Array.isArray(files)) {
        files = [files];
    }

    files.forEach((file, index) => {
        const fileCard = createFileCard(file);
        filesGrid.appendChild(fileCard);
    });

    updateStatistics(files);
}

// ===============================
// CREAR TARJETA DE ARCHIVO
// ===============================

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.dataset.type = getFileType(file.name);
    card.dataset.fileName = file.name;

    const icon = getFileIcon(file.name);
    const size = formatFileSize(file.size);
    const rating = ratingsDatabase[file.name];
    const ratingHTML = rating ? `<div class="rating-badge">⭐ ${rating.average.toFixed(1)}/5</div>` : '';

    card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <h3>${file.name}</h3>
        <p><strong>Tamaño:</strong> ${size}</p>
        <p><strong>Tipo:</strong> ${getFileType(file.name)}</p>
        ${ratingHTML}
        <div class="file-actions">
            <button class="btn btn-small btn-primary" onclick="openFileDetails('${file.name}', '${file.html_url}', ${file.size})">
                ℹ️ Detalles
            </button>
            <a href="${file.html_url}" target="_blank" class="btn btn-small btn-secondary">
                🔗 Ver
            </a>
        </div>
    `;

    return card;
}

// ===============================
// UTILIDADES DE ARCHIVO
// ===============================

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        'pdf': 'PDF',
        'js': 'JavaScript',
        'html': 'HTML',
        'css': 'CSS',
        'json': 'JSON',
        'txt': 'Texto',
        'md': 'Markdown',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C'
    };
    return types[ext] || 'Archivo';
}

function getFileIcon(filename) {
    const type = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄',
        'js': '⚙️',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'txt': '📝',
        'md': '📖',
        'py': '🐍',
        'java': '☕',
        'cpp': '⚡',
        'c': '🔧'
    };
    return icons[type] || '📁';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===============================
// MODAL Y DETALLES DE ARCHIVO
// ===============================

function openFileDetails(fileName, fileUrl, fileSize) {
    currentFile = fileName;
    const modal = document.getElementById('fileModal');
    
    document.getElementById('modalTitle').textContent = `📌 ${fileName}`;
    document.getElementById('modalSize').textContent = formatFileSize(fileSize);
    document.getElementById('modalType').textContent = getFileType(fileName);
    document.getElementById('modalLink').href = fileUrl;
    document.getElementById('modalLink').textContent = fileUrl;

    // Cargar rating del archivo
    loadFileRating(fileName);

    modal.style.display = 'block';
}

function loadFileRating(fileName) {
    const ratingStars = document.getElementById('ratingStars');
    const ratingText = document.getElementById('ratingText');
    const ratingComment = document.getElementById('ratingComment');

    // Resetear estrellas
    ratingStars.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
        star.addEventListener('click', function() {
            selectRating(this.dataset.value);
        });
    });

    ratingComment.value = '';

    if (ratingsDatabase[fileName]) {
        ratingText.textContent = `Promedio: ${ratingsDatabase[fileName].average.toFixed(1)}/5 (${ratingsDatabase[fileName].ratings.length} valoraciones)`;
    } else {
        ratingText.textContent = 'Sé el primero en valorar este archivo';
    }
}

function selectRating(value) {
    const stars = document.getElementById('ratingStars').querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active');
        if (star.dataset.value <= value) {
            star.classList.add('active');
        }
    });
}

function submitRating() {
    if (!currentFile) return;

    const activeStars = document.querySelectorAll('.star.active');
    if (activeStars.length === 0) {
        showToast('Por favor selecciona una calificación', 'warning');
        return;
    }

    const rating = activeStars.length;
    const comment = document.getElementById('ratingComment').value;

    // Guardar en base de datos local
    if (!ratingsDatabase[currentFile]) {
        ratingsDatabase[currentFile] = {
            ratings: [],
            average: 0
        };
    }

    ratingsDatabase[currentFile].ratings.push({
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString()
    });

    // Calcular promedio
    const ratings = ratingsDatabase[currentFile].ratings;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    ratingsDatabase[currentFile].average = sum / ratings.length;

    // Guardar en localStorage
    localStorage.setItem('fileRatings', JSON.stringify(ratingsDatabase));

    showToast('¡Valoración guardada exitosamente! ⭐', 'success');
    
    // Actualizar la tarjeta del archivo
    updateFileCardRating(currentFile);
    updateStatistics();

    // Cerrar modal después de 1 segundo
    setTimeout(() => {
        closeModal();
    }, 1000);
}

function updateFileCardRating(fileName) {
    const card = document.querySelector(`[data-fileName="${fileName}"]`);
    if (card) {
        const ratingBadge = card.querySelector('.rating-badge');
        const rating = ratingsDatabase[fileName];
        
        if (ratingBadge) {
            ratingBadge.textContent = `⭐ ${rating.average.toFixed(1)}/5`;
        } else {
            const newBadge = document.createElement('div');
            newBadge.className = 'rating-badge';
            newBadge.textContent = `⭐ ${rating.average.toFixed(1)}/5`;
            card.insertBefore(newBadge, card.querySelector('.file-actions'));
        }
    }
}

function closeModal() {
    document.getElementById('fileModal').style.display = 'none';
    currentFile = null;
}

// ===============================
// FILTROS
// ===============================

function setupEventListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilter(this.dataset.filter);
        });
    });

    // Cerrar modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('fileModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

function applyFilter(filter) {
    const cards = document.querySelectorAll('.file-card');
    cards.forEach(card => {
        if (filter === 'todos' || card.dataset.type === filter || 
            (filter === 'otros' && !['PDF', 'JavaScript', 'HTML', 'CSS'].includes(card.dataset.type))) {
            card.style.display = 'block';
            card.animation = 'fadeInUp 0.6s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===============================
// ESTADÍSTICAS
// ===============================

async function updateStatistics(files = null) {
    if (!files) {
        try {
            const response = await fetch(`${GITHUB_API}/contents`);
            if (response.ok) {
                files = await response.json();
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    if (!files) files = [];
    if (!Array.isArray(files)) files = [files];

    // Contar archivos
    document.getElementById('totalFiles').textContent = files.length;

    // Calcular tamaño total
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);

    // Calcular calificación promedio
    const ratings = Object.values(ratingsDatabase);
    if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.average, 0) / ratings.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        document.getElementById('totalRatings').textContent = ratings.reduce((sum, r) => sum + r.ratings.length, 0);
    } else {
        document.getElementById('avgRating').textContent = '0.0';
        document.getElementById('totalRatings').textContent = '0';
    }
}

// ===============================
// DATOS DE DEMOSTRACIÓN
// ===============================

function loadDemoFiles() {
    const demoFiles = [
        {
            name: 'Sistematización de apuntes.pdf',
            size: 812334,
            type: 'file',
            html_url: 'https://github.com/menabiancacom2009-ship-it/Repositorio-Ia-2BGU-A/blob/main/Sistematizaci%C3%B3n%20de%20apuntes%20.pdf'
        },
        {
            name: 'script.js',
            size: 2580,
            type: 'file',
            html_url: 'https://github.com/menabiancacom2009-ship-it/Repositorio-Ia-2BGU-A/blob/main/script.js'
        },
        {
            name: 'index.html',
            size: 4200,
            type: 'file',
            html_url: 'https://github.com/menabiancacom2009-ship-it/Repositorio-Ia-2BGU-A/blob/main/index.html'
        },
        {
            name: 'styles.css',
            size: 6800,
            type: 'file',
            html_url: 'https://github.com/menabiancacom2009-ship-it/Repositorio-Ia-2BGU-A/blob/main/styles.css'
        }
    ];

    displayFiles(demoFiles);
}

// ===============================
// NOTIFICACIONES
// ===============================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===============================
// EXPORTAR DATOS (BONUS)
// ===============================

function exportRatings() {
    const dataStr = JSON.stringify(ratingsDatabase, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ratings.json';
    link.click();
}

// ===============================
// LIMPIAR DATOS (BONUS)
// ===============================

function clearAllRatings() {
    if (confirm('¿Estás seguro de que deseas eliminar todas las valoraciones?')) {
        ratingsDatabase = {};
        localStorage.clear();
        updateStatistics();
        showToast('Todas las valoraciones han sido eliminadas', 'info');
    }
}

// ===============================
// CONSOLE LOG
// ===============================

console.log('🤖 Aplicación de Repositorio IA cargada correctamente');
console.log('📊 Sistema de valoraciones activado');
console.log('💾 Base de datos local disponible');