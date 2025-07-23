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
let segments = 1;
let segmentData = [{}]; // Array to store data for each segment

function addSegment() {
    if (segments >= 3) return;
    saveSegmentData(); // Save current before adding
    segments++;
    segmentData.push({}); // Add empty for new
    renderSegments();
}

function removeSegment(index) {
    if (segments <= 1) return;
    saveSegmentData(); // Save before removal
    segmentData.splice(index, 1); // Remove specific
    segments--;
    renderSegments();
    calculate(); // Auto-recalc
}

function renderSegments() {
    const container = document.getElementById('segments-container');
    container.innerHTML = '';
    for (let i = 0; i < segments; i++) {
        const segId = i + 1;
        container.insertAdjacentHTML('beforeend', `
            <div class="segment" id="segment-${segId}">
                <div class="segment-header">
                    <h3>Segment ${segId}</h3>
                    <button class="remove-segment" onclick="removeSegment(${i})" aria-label="Remove Segment ${segId}">×</button>
                </div>
                <label title="Select fiber type for this segment.">Fiber Type:</label>
                <select id="fiber-type-${segId}" onchange="updateWavelengthOptions(${segId})" aria-label="Fiber Type Segment ${segId}">
                    <option value="OS2">OS2</option>
                    <option value="OM3">OM3</option>
                    <option value="OM4">OM4</option>
                    <option value="OM5">OM5</option>
                </select>
                <div id="fiber-type-${segId}-error" class="error-message"></div>

                <label title="Select wavelength for calculations.">Wavelength:</label>
                <select id="wavelength-${segId}" aria-label="Wavelength Segment ${segId}"></select>
                <div id="wavelength-${segId}-error" class="error-message"></div>

                <label title="Distance in selected units (converts automatically).">Distance:</label>
                <input type="number" id="distance-${segId}" min="0" step="0.1" placeholder="e.g., 1000" aria-label="Distance Segment ${segId}">
                <div id="distance-${segId}-error" class="error-message"></div>

                <label title="Toggle units between km and meters.">Units:</label>
                <select id="units-${segId}" aria-label="Units Segment ${segId}">
                    <option value="km">km</option>
                    <option value="meters">meters</option>
                </select>
                <div id="units-${segId}-error" class="error-message"></div>

                <label title="Number of splices in this segment.">Splice Count:</label>
                <input type="number" id="splice-count-${segId}" min="0" step="1" placeholder="e.g., 2" aria-label="Splice Count Segment ${segId}">
                <div id="splice-count-${segId}-error" class="error-message"></div>

                <label title="Number of connectors in this segment.">Connector Count:</label>
                <input type="number" id="connector-count-${segId}" min="0" step="1" placeholder="e.g., 4" aria-label="Connector Count Segment ${segId}">
                <div id="connector-count-${segId}-error" class="error-message"></div>
            </div>
        `);
        // Restore data if exists
        if (segmentData[i]) {
            document.getElementById(`fiber-type-${segId}`).value = segmentData[i].fiberType || 'OS2';
            updateWavelengthOptions(segId);
            document.getElementById(`wavelength-${segId}`).value = segmentData[i].wavelength || Object.keys(FIBER_STANDARDS['OS2'].wavelengths)[0];
            document.getElementById(`distance-${segId}`).value = segmentData[i].distance || '';
            document.getElementById(`units-${segId}`).value = segmentData[i].units || 'meters';
            document.getElementById(`splice-count-${segId}`).value = segmentData[i].spliceCount || '';
            document.getElementById(`connector-count-${segId}`).value = segmentData[i].connectorCount || '';
        } else {
            updateWavelengthOptions(segId); // Initial for new segments
        }
    }
}

function saveSegmentData() {
    for (let i = 1; i <= segments; i++) {
        segmentData[i-1] = {
            fiberType: document.getElementById(`fiber-type-${i}`).value,
            wavelength: document.getElementById(`wavelength-${i}`).value,
            distance: document.getElementById(`distance-${i}`).value,
            units: document.getElementById(`units-${i}`).value,
            spliceCount: document.getElementById(`splice-count-${i}`).value,
            connectorCount: document.getElementById(`connector-count-${i}`).value
        };
    }
}

// Update Wavelength Dropdown
function updateWavelengthOptions(segId) {
    const fiberType = document.getElementById(`fiber-type-${segId}`).value;
    const wlSelect = document.getElementById(`wavelength-${segId}`);
    wlSelect.innerHTML = '';
    Object.keys(FIBER_STANDARDS[fiberType].wavelengths).forEach(wl => {
        wlSelect.insertAdjacentHTML('beforeend', `<option value="${wl}">${wl}</option>`);
    });
}

// Toggle Custom Inputs
function toggleCustomInputs() {
    document.getElementById('custom-inputs').style.display = document.getElementById('custom-toggle').checked ? 'grid' : 'none';
}

// Validation
function validateInputs() {
    let valid = true;
    // Clear all errors first
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    // Validate per-segment inputs
    for (let i = 1; i <= segments; i++) {
        const fields = [
            { id: `distance-${i}`, min: 0, msg: 'Distance must be a positive number.' },
            { id: `splice-count-${i}`, min: 0, msg: 'Splice count must be a non-negative integer.' },
            { id: `connector-count-${i}`, min: 0, msg: 'Connector count must be a non-negative integer.' }
        ];
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const errorEl = document.getElementById(`${field.id}-error`);
            const value = parseFloat(input.value);
            if (input.value === '' || isNaN(value) || value < field.min) {
                input.classList.add('input-error');
                errorEl.textContent = field.msg;
                valid = false;
            }
        });
    }

    // Validate global inputs (safety margin, customs if enabled)
    const safetyInput = document.getElementById('safety-margin');
    if (safetyInput.value === '' || isNaN(parseFloat(safetyInput.value)) || parseFloat(safetyInput.value) < 0) {
        safetyInput.classList.add('input-error');
        valid = false;
    }

    if (document.getElementById('custom-toggle').checked) {
        const customFields = ['custom-attenuation', 'custom-splice', 'custom-connector'];
        customFields.forEach(id => {
            const input = document.getElementById(id);
            if (input.value === '' || isNaN(parseFloat(input.value)) || parseFloat(input.value) < 0) {
                input.classList.add('input-error');
                valid = false;
            }
        });
    }

    return valid;
}

// Calculation
function calculate() {
    if (!validateInputs()) {
        alert('Please fix invalid inputs (highlighted in red).');
        return;
    }
    saveSegmentData(); // Save before calc

    let totalFiberLoss = 0, totalSpliceLoss = 0, totalConnectorLoss = 0, totalDistance = 0;
    const safetyMargin = parseFloat(document.getElementById('safety-margin').value) || 3;
    const useCustom = document.getElementById('custom-toggle').checked;
    const customAtten = useCustom ? parseFloat(document.getElementById('custom-attenuation').value) || 0 : null;
    const customSplice = useCustom ? parseFloat(document.getElementById('custom-splice').value) || 0 : null;
    const customConnector = useCustom ? parseFloat(document.getElementById('custom-connector').value) || 0 : null;

    for (let i = 0; i < segments; i++) {
        const segId = i + 1;
        const fiberType = document.getElementById(`fiber-type-${segId}`).value;
        const wl = document.getElementById(`wavelength-${segId}`).value;
        const params = FIBER_STANDARDS[fiberType];
        let distance = parseFloat(document.getElementById(`distance-${segId}`).value);
        const units = document.getElementById(`units-${segId}`).value;
        if (units === 'meters') distance /= 1000; // Convert to km
        const spliceCount = parseInt(document.getElementById(`splice-count-${segId}`).value) || 0;
        const connectorCount = parseInt(document.getElementById(`connector-count-${segId}`).value) || 0;

        if (distance > params.max_distance_m / 1000) {
            alert(`Segment ${segId}: Distance of ${distance} km exceeds max for ${fiberType} (${params.max_distance_m / 1000} km).`);
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

    // Example budget (use first segment's fiber)
    const firstFiber = document.getElementById('fiber-type-1').value;
    const budget = FIBER_STANDARDS[firstFiber].budgets['10G'];
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

// Clear Fields (Resets data array too)
function clearFields() {
    segments = 1;
    segmentData = [{}];
    renderSegments();
    document.getElementById('safety-margin').value = '3';
    document.getElementById('custom-toggle').checked = false;
    toggleCustomInputs();
    document.getElementById('output').innerHTML = '';
}

// Tab Switching
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none'; // Explicit hide for reliability
    });
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById(tabName);
    activeTab.classList.add('active');
    activeTab.style.display = 'block';
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    toggleDarkMode(); // Dark mode default
    updateFontSize(); // Initial font size
    renderSegments(); // Initial segment
    openTab('calculator'); // Ensure calculator is active on load

    // Image check
    const img = document.getElementById('otdr-image');
    img.onerror = () => {
        img.style.display = 'none';
        document.getElementById('image-fallback').style.display = 'block';
    };
});
