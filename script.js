// Data Store (Enhanced with Budgets from TIA/ISO/IEEE - e.g., for 10G Ethernet)
const FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25},
        'budgets': {'10G': 10, '40G': 8} // Example dB budgets for common apps (from standards)
    },
    'OM3': {
        'name': 'Multimode OM3', 'max_distance_m': 300,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'10G': 2.6, '40G': 1.9}
    },
    'OM4': {
        'name': 'Multimode OM4', 'max_distance_m': 400,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'10G': 2.6, '40G': 1.9}
    },
    'OM5': {
        'name': 'Multimode OM5', 'max_distance_m': 440,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'10G': 2.6, '40G': 1.9}
    }
};

// Segment Management
let segments = 1; // Start with 1 segment
function addSegment() {
    if (segments >= 3) return;
    segments++;
    renderSegments();
}
function removeSegment() {
    if (segments <= 1) return;
    segments--;
    renderSegments();
}
function renderSegments() {
    const container = document.getElementById('segments-container');
    container.innerHTML = '';
    for (let i = 1; i <= segments; i++) {
        container.insertAdjacentHTML('beforeend', `
            <h3>Segment ${i}</h3>
            <label title="Select fiber type for this segment.">Fiber Type:</label>
            <select id="fiber-type-${i}" onchange="updateWavelengthOptions(${i})" aria-label="Fiber Type Segment ${i}">
                <option value="OS2" selected>OS2</option>
                <option value="OM3">OM3</option>
                <option value="OM4">OM4</option>
                <option value="OM5">OM5</option>
            </select>

            <label title="Select wavelength for calculations.">Wavelength:</label>
            <select id="wavelength-${i}" aria-label="Wavelength Segment ${i}"></select>

            <label title="Distance in selected units (converts automatically).">Distance:</label>
            <input type="number" id="distance-${i}" min="0" step="0.1" placeholder="e.g., 1000" aria-label="Distance Segment ${i}">

            <label title="Toggle units between km and meters.">Units:</label>
            <select id="units-${i}" aria-label="Units Segment ${i}">
                <option value="km">km</option>
                <option value="meters" selected>meters</option>
            </select>

            <label title="Number of splices in this segment.">Splice Count:</label>
            <input type="number" id="splice-count-${i}" min="0" step="1" placeholder="e.g., 2" aria-label="Splice Count Segment ${i}">

            <label title="Number of connectors in this segment.">Connector Count:</label>
            <input type="number" id="connector-count-${i}" min="0" step="1" placeholder="e.g., 4" aria-label="Connector Count Segment ${i}">
        `);
        updateWavelengthOptions(i); // Initialize wavelengths
    }
}

// Update Wavelength Dropdown
function updateWavelengthOptions(segmentId) {
    const fiberType = document.getElementById(`fiber-type-${segmentId}`).value;
    const wlSelect = document.getElementById(`wavelength-${segmentId}`);
    wlSelect.innerHTML = '';
    Object.keys(FIBER_STANDARDS[fiberType].wavelengths).forEach(wl => {
        wlSelect.insertAdjacentHTML('beforeend', `<option value="${wl}">${wl}</option>`);
    });
}

// Toggle Custom Inputs
function toggleCustomInputs() {
    document.getElementById('custom-inputs').style.display = document.getElementById('custom-toggle').checked ? 'grid' : 'none';
}

// Tab Switching, Dark Mode, Font Size (Preserved, with ARIA)
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark', document.getElementById('dark-mode-toggle').checked);
}

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

// Modals (Preserved)
function showReadme() {
    document.getElementById('readme-modal').style.display = 'flex';
}
function closeReadme() {
    document.getElementById('readme-modal').style.display = 'none';
}

function enlargeImage() {
    document.getElementById('image-modal').style.display = 'flex';
}
function closeImageModal() {
    document.getElementById('image-modal').style.display = 'none';
}

// Live Validation
function validateInputs() {
    let valid = true;
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.classList.remove('input-error');
        if (input.value === '' || isNaN(parseFloat(input.value)) || parseFloat(input.value) < input.min) {
            input.classList.add('input-error');
            valid = false;
        }
    });
    return valid;
}

// Calculation (Enhanced)
function calculate() {
    if (!validateInputs()) {
        alert('Please fix invalid inputs (highlighted in red).');
        return;
    }

    let totalFiberLoss = 0, totalSpliceLoss = 0, totalConnectorLoss = 0, totalDistance = 0;
    const safetyMargin = parseFloat(document.getElementById('safety-margin').value) || 3;
    const useCustom = document.getElementById('custom-toggle').checked;
    const customAtten = useCustom ? parseFloat(document.getElementById('custom-attenuation').value) || 0 : null;
    const customSplice = useCustom ? parseFloat(document.getElementById('custom-splice').value) || 0 : null;
    const customConnector = useCustom ? parseFloat(document.getElementById('custom-connector').value) || 0 : null;

    for (let i = 1; i <= segments; i++) {
        const fiberType = document.getElementById(`fiber-type-${i}`).value;
        const wl = document.getElementById(`wavelength-${i}`).value;
        const params = FIBER_STANDARDS[fiberType];
        let distance = parseFloat(document.getElementById(`distance-${i}`).value);
        const units = document.getElementById(`units-${i}`).value;
        if (units === 'meters') distance /= 1000; // Convert to km
        const spliceCount = parseInt(document.getElementById(`splice-count-${i}`).value) || 0;
        const connectorCount = parseInt(document.getElementById(`connector-count-${i}`).value) || 0;

        if (distance > params.max_distance_m / 1000) { // Convert max to km
            alert(`Segment ${i}: Distance of ${distance} km exceeds max for ${fiberType} (${params.max_distance_m / 1000} km).`);
            return;
        }

        const atten = customAtten !== null ? customAtten : params.wavelengths[wl].typical_attenuation_db_km;
        const spliceLoss = customSplice !== null ? customSplice : params.splice_loss.typical_db;
        const connectorLoss = customConnector !== null ? customConnector : params.connector_loss.typical_db;

        totalFiberLoss += distance * atten;
        totalSpliceLoss += spliceCount * spliceLoss;
        totalConnectorLoss += connectorCount * connectorLoss;
        totalDistance += distance;
    }

    const totalLoss = totalFiberLoss + totalSpliceLoss + totalConnectorLoss + safetyMargin;

    // Example budget (select first segment's fiber for simplicity; enhance if needed)
    const firstFiber = document.getElementById('fiber-type-1').value;
    const budget = FIBER_STANDARDS[firstFiber].budgets['10G']; // Default to 10G; could add dropdown
    const margin = budget - totalLoss;
    const status = margin >= 0 ? '<span class="pass">Pass</span>' : '<span class="fail">Fail</span>';

    let output = '<h1>📊 Link Loss Budget Results</h1>';
    output += `<p>Total Distance: ${totalDistance.toFixed(2)} km | Safety Margin: ${safetyMargin} dB</p>`;
    output += '<table class="output-table"><tr><th>Component</th><th>Loss (dB)</th></tr>';
    output += `<tr><td>Fiber Attenuation</td><td>${totalFiberLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Splice Loss</td><td>${totalSpliceLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Connector Loss</td><td>${totalConnectorLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Safety Margin</td><td>${safetyMargin.toFixed(2)}</td></tr>`;
    output += `<tr><th>Total Loss</th><th>${totalLoss.toFixed(2)}</th></tr></table>`;
    output += `<p>Budget (10G Ethernet Example): ${budget} dB | Margin: ${margin.toFixed(2)} dB | Status: ${status}</p>`;
    output += '<p><em>Values based on standards; <a href="#" onclick="showReadme()">verify in Readme</a>.</em></p>';
    output += '<canvas id="loss-chart"></canvas>';

    document.getElementById('output').innerHTML = output;
    drawChart(totalFiberLoss, totalSpliceLoss, totalConnectorLoss, safetyMargin);
}

// Draw Simple Bar Chart
function drawChart(fiber, splice, connector, margin) {
    const canvas = document.getElementById('loss-chart');
    const ctx = canvas.getContext('2d');
    const data = [fiber, splice, connector, margin];
    const labels = ['Fiber', 'Splice', 'Connector', 'Margin'];
    const colors = ['#003399', '#569CD6', '#3CB371', '#FFA500'];
    const maxVal = Math.max(...data) * 1.2;
    const barWidth = canvas.width / data.length - 20;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((val, i) => {
        const barHeight = (val / maxVal) * canvas.height;
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * (barWidth + 20) + 10, canvas.height - barHeight, barWidth, barHeight);
        ctx.fillStyle = document.body.classList.contains('dark') ? '#FFF' : '#000';
        ctx.fillText(labels[i], i * (barWidth + 20) + 10, canvas.height - 5);
        ctx.fillText(val.toFixed(2), i * (barWidth + 20) + 10, canvas.height - barHeight - 5);
    });
}

// Export PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Link Loss Budget Results', 10, 10);
    doc.fromHTML(document.getElementById('output').innerHTML, 10, 20);
    doc.save('loss-budget.pdf');
}

// Copy Results
function copyResults() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('Results copied to clipboard!');
}

// Clear Fields
function clearFields() {
    segments = 1;
    renderSegments();
    document.getElementById('safety-margin').value = '3';
    document.getElementById('custom-toggle').checked = false;
    toggleCustomInputs();
    document.getElementById('output').innerHTML = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    toggleDarkMode(); // Dark mode default
    updateFontSize(); // Initial font
    renderSegments(); // Initial segment

    // Image check (preserved)
    const img = document.getElementById('otdr-image');
    img.onerror = () => {
        img.style.display = 'none';
        document.getElementById('image-fallback').style.display = 'block';
    };
});

/* Segment Header with Remove Button */
.segment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.remove-segment { background: #FF0000; color: #FFF; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1; }
.remove-segment:hover { background: #CC0000; }

/* Validation */
.input-error { border: 2px solid #FF0000 !important; }
.error-message { color: #FF0000; grid-column: span 2; font-size: 0.9em; margin-top: -10px; }

/* Image Modal Close Button (Moved Below) */
#image-modal { flex-direction: column; justify-content: center; align-items: center; }
.modal-image { margin-bottom: 10px; }
#image-modal .close { position: static; margin-top: 10px; font-size: 32px; color: #FFF; cursor: pointer; }
#image-modal .close:hover { color: #CCC; }

/* Ensure Label Left, Input Right (Grid) */
.input-section label { text-align: left; }
.input-section input, .input-section select { justify-self: start; }
