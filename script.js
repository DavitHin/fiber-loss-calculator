// Data Store (Preserved from Python)
const FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25}
    },
    'OM3': {
        'name': 'Multimode OM3', 'max_distance_m': 300,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    },
    'OM4': {
        'name': 'Multimode OM4', 'max_distance_m': 400,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    },
    'OM5': {
        'name': 'Multimode OM5', 'max_distance_m': 440,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    }
};

// Tab Switching
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark', document.getElementById('dark-mode-toggle').checked);
}

// Font Size Update
let fontSize = 14;
function updateFontSize() {
    fontSize = parseInt(document.getElementById('font-size-slider').value);
    document.querySelectorAll('.content-text').forEach(el => {
        el.style.fontSize = `${fontSize}px`;
        el.querySelectorAll('h1').forEach(h => h.style.fontSize = `${fontSize + 2}px`);
        el.querySelectorAll('h2').forEach(h => h.style.fontSize = `${fontSize + 1}px`);
    });
}
function changeFontSize(delta) {
    const slider = document.getElementById('font-size-slider');
    let newSize = parseInt(slider.value) + delta;
    if (newSize >= 8 && newSize <= 20) {
        slider.value = newSize;
        updateFontSize();
    }
}

// Readme Modal
function showReadme() {
    document.getElementById('readme-modal').style.display = 'flex';
}
function closeReadme() {
    document.getElementById('readme-modal').style.display = 'none';
}

// Image Enlargement Modal
function enlargeImage() {
    document.getElementById('image-modal').style.display = 'flex';
}
function closeImageModal() {
    document.getElementById('image-modal').style.display = 'none';
}

// Calculation (Ported from Python)
function calculate() {
    const fiberType = document.getElementById('fiber-type').value;
    const params = FIBER_STANDARDS[fiberType];
    const distance = parseFloat(document.getElementById('distance').value);
    const spliceCount = parseInt(document.getElementById('splice-count').value);
    const connectorCount = parseInt(document.getElementById('connector-count').value);

    if (isNaN(distance) || isNaN(spliceCount) || isNaN(connectorCount)) {
        alert('Please enter valid numbers for distance, splices, and connectors.');
        return;
    }

    if (distance > params.max_distance_m) {
        alert(`The entered distance of ${distance}m exceeds the recommended maximum of ${params.max_distance_m}m for ${fiberType}. Please enter a valid length.`);
        return;
    }

    let output = '<h1>📊 Link Loss Budget Results</h1>';
    output += `<strong>Fiber Type:</strong> ${params.name}<br>`;
    output += '--------------------------------------------------------<br>';

    for (let wl in params.wavelengths) {
        const atten = params.wavelengths[wl];
        const maxLoss = (distance / 1000 * atten.max_attenuation_db_km) + (spliceCount * params.splice_loss.max_db) + (connectorCount * params.connector_loss.max_db);
        const typLoss = (distance / 1000 * atten.typical_attenuation_db_km) + (spliceCount * params.splice_loss.typical_db) + (connectorCount * params.connector_loss.typical_db);
        output += `<h2>📈 Results for Wavelength: ${wl}</h2>`;
        output += `<strong>  - Highest Acceptable Loss:</strong> <span class="pass">${maxLoss.toFixed(2)} dB</span><br>`;
        output += `<strong>  - Typical Good Performance:</strong> ${typLoss.toFixed(2)} dB<br>`;
        output += '--------------------------------------------------------<br>';
    }

    document.getElementById('output').innerHTML = output;
}

// Clear Fields
function clearFields() {
    document.getElementById('distance').value = '';
    document.getElementById('splice-count').value = '';
    document.getElementById('connector-count').value = '';
    document.getElementById('output').innerHTML = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    toggleDarkMode(); // Set dark mode default
    updateFontSize(); // Set initial font size

    // Check if image exists (hide if not)
    const img = document.getElementById('otdr-image');
    img.onerror = () => {
        img.style.display = 'none';
        document.getElementById('image-fallback').style.display = 'block';
    };
});
