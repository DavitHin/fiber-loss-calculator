// Data Store (Unchanged)
const FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25},
        'budgets': {'25G': 6, '50G': 5, '100G': 5}
    },
    'OM3': {
        'name': 'Multimode OM3', 'max_distance_m': 300,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'25G': 1.8, '50G': 1.6, '100G': 1.5}
    },
    'OM4': {
        'name': 'Multimode OM4', 'max_distance_m': 400,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'25G': 1.8, '50G': 1.6, '100G': 1.5}
    },
    'OM5': {
        'name': 'Multimode OM5', 'max_distance_m': 440,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'25G': 1.8, '50G': 1.6, '100G': 1.5}
    }
};

// Global results for PDF
let lastResults = null;

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
                <div class="pair">
                    <label title="Select fiber type for this segment.">Fiber Type:</label>
                    <select id="fiber-type-${segId}" onchange="updateWavelengthOptions(${segId})" aria-label="Fiber Type Segment ${segId}">
                        <option value="OS2">OS2</option>
                        <option value="OM3">OM3</option>
                        <option value="OM4">OM4</option>
                        <option value="OM5">OM5</option>
                    </select>
                </div>
                <div id="fiber-type-${segId}-error" class="error-message"></div>

                <div class="pair">
                    <label title="Select wavelength for calculations.">Wavelength:</label>
                    <select id="wavelength-${segId}" aria-label="Wavelength Segment ${segId}"></select>
                </div>
                <div id="wavelength-${segId}-error" class="error-message"></div>

                <div class="pair">
                    <label title="Distance in selected units (converts automatically).">Distance:</label>
                    <input type="number" id="distance-${segId}" min="0" step="0.1" placeholder="e.g., 1000" aria-label="Distance Segment ${segId}">
                </div>
                <div id="distance-${segId}-error" class="error-message"></div>

                <div class="pair">
                    <label title="Toggle units between km and meters.">Units:</label>
                    <select id="units-${segId}" aria-label="Units Segment ${segId}">
                        <option value="km">km</option>
                        <option value="meters">meters</option>
                    </select>
                </div>
                <div id="units-${segId}-error" class="error-message"></div>

                <div class="pair">
                    <label title="Number of splices in this segment.">Splice Count:</label>
                    <input type="number" id="splice-count-${segId}" min="0" step="1" placeholder="e.g., 2" aria-label="Splice Count Segment ${segId}">
                </div>
                <div id="splice-count-${segId}-error" class="error-message"></div>

                <div class="pair">
                    <label title="Number of connectors in this segment.">Connector Count:</label>
                    <input type="number" id="connector-count-${segId}" min="0" step="1" placeholder="e.g., 4" aria-label="Connector Count Segment ${segId}">
                </div>
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
    validateAndToggleButton(); // Check validation after render
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
    validateAndToggleButton(); // Re-validate on toggle
}

// Inline Validation and Button Toggle (Integrated Max Length Check with Precision)
function validateAndToggleButton() {
    let valid = true;
    // Clear all errors first
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('validation-summary').textContent = '';

    // Validate per-segment inputs, including max length
    for (let i = 1; i <= segments; i++) {
        const fiberType = document.getElementById(`fiber-type-${i}`).value;
        const params = FIBER_STANDARDS[fiberType];
        const maxKm = params.max_distance_m / 1000;

        const fields = [
            { id: `distance-${i}`, min: 0, msg: 'Required: Positive number.' },
            { id: `splice-count-${i}`, min: 0, msg: 'Required: Non-negative integer.' },
            { id: `connector-count-${i}`, min: 0, msg: 'Required: Non-negative integer.' }
        ];
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const errorEl = document.getElementById(`${field.id}-error`);
            const value = parseFloat(input.value);
            if (input.value.trim() === '' || isNaN(value) || value < field.min) {
                input.classList.add('input-error');
                errorEl.textContent = field.msg;
                valid = false;
            }
        });

        // Max length check (inline with precision)
        const distanceInput = document.getElementById(`distance-${i}`);
        let distance = parseFloat(distanceInput.value);
        const units = document.getElementById(`units-${i}`).value;
        if (units === 'meters') distance /= 1000;
        const distanceErrorEl = document.getElementById(`distance-${i}-error`);
        if (distance > maxKm && distanceInput.value.trim() !== '') { // Only check if value entered
            distanceInput.classList.add('input-error');
            distanceErrorEl.textContent = `Exceeds max for ${fiberType} (${maxKm.toFixed(2)} km).`;
            valid = false;
        }
    }

    // Validate global inputs
    const safetyInput = document.getElementById('safety-margin');
    if (safetyInput.value.trim() === '' || isNaN(parseFloat(safetyInput.value)) || parseFloat(safetyInput.value) < 0) {
        safetyInput.classList.add('input-error');
        valid = false;
    }

    if (document.getElementById('custom-toggle').checked) {
        const customFields = ['custom-attenuation', 'custom-splice', 'custom-connector'];
        customFields.forEach(id => {
            const input = document.getElementById(id);
            if (input.value.trim() === '' || isNaN(parseFloat(input.value)) || parseFloat(input.value) < 0) {
                input.classList.add('input-error');
                valid = false;
            }
        });
    }

    // Toggle Calculate button
    const calcButton = document.getElementById('calculate-button');
    calcButton.disabled = !valid;
    if (!valid) {
        document.getElementById('validation-summary').textContent = 'Please fix fields with remarks to calculate.';
    }
    return valid;
}

// Calculation
function calculate() {
    if (!validateAndToggleButton()) {
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

        const atten = customAtten !== null ? customAtten : params.wavelengths[wl].typical_attenuation_db_km;
        const spliceLoss = customSplice !== null ? customSplice : params.splice_loss.typical_db;
        const connectorLoss = customConnector !== null ? customConnector : params.connector_loss.typical_db;

        totalFiberLoss += distance * atten;
        totalSpliceLoss += spliceCount * spliceLoss;
        totalConnectorLoss += connectorCount * connectorLoss;
        totalDistance += distance;
    }

    const totalLoss = totalFiberLoss + totalSpliceLoss + totalConnectorLoss + safetyMargin;

    // Budgets for 25G/50G/100G (use first segment's fiber)
    const firstFiber = document.getElementById('fiber-type-1').value;
    const budgets = FIBER_STANDARDS[firstFiber].budgets;
    let budgetOutput = '<h2>Budget Analysis (Ethernet Examples)</h2><table class="output-table"><tr><th>Speed</th><th>Budget (dB)</th><th>Margin (dB)</th><th>Status</th></tr>';
    ['25G', '50G', '100G'].forEach(speed => {
        const budget = budgets[speed];
        const margin = budget - totalLoss;
        const status = margin >= 0 ? '<span class="pass">Pass</span>' : '<span class="fail">Fail</span>';
        budgetOutput += `<tr><td>${speed}</td><td>${budget}</td><td>${margin.toFixed(2)}</td><td>${status}</td></tr>`;
    });
    budgetOutput += '</table>';

    let output = '<h1>📊 Link Loss Budget Results</h1>';
    output += `<p>Total Distance: ${totalDistance.toFixed(2)} km | Safety Margin: ${safetyMargin} dB</p>`;
    output += '<table class="output-table"><tr><th>Component</th><th>Loss (dB)</th></tr>';
    output += `<tr><td>Fiber Attenuation</td><td>${totalFiberLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Splice Loss</td><td>${totalSpliceLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Connector Loss</td><td>${totalConnectorLoss.toFixed(2)}</td></tr>`;
    output += `<tr><td>Safety Margin</td><td>${safetyMargin.toFixed(2)}</td></tr>`;
    output += `<tr><th>Total Loss</th><th>${totalLoss.toFixed(2)}</th></tr></table>`;
    output += budgetOutput;
    output += '<p><em>Values based on standards; <a href="#" onclick="showReadme()">verify in Readme</a>.</em></p>';
    output += '<canvas id="loss-chart"></canvas>';

    document.getElementById('output').innerHTML = output;
    drawChart(totalFiberLoss, totalSpliceLoss, totalConnectorLoss, safetyMargin);

    // Update global results for PDF
    lastResults = {
        totalDistance: totalDistance.toFixed(2),
        safetyMargin: safetyMargin,
        totalFiberLoss: totalFiberLoss.toFixed(2),
        totalSpliceLoss: totalSpliceLoss.toFixed(2),
        totalConnectorLoss: totalConnectorLoss.toFixed(2),
        totalLoss: totalLoss.toFixed(2),
        budgets: budgets
    };
}

// Draw Simple Bar Chart (Unchanged)
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

// Export PDF (Fixed with global results and text-based gen)
function exportPDF() {
    if (!lastResults) {
        document.getElementById('validation-summary').textContent = 'Run calculation first to export.';
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Link Loss Budget Results', 10, 10);

    doc.setFontSize(12);
    doc.text(`Total Distance: ${lastResults.totalDistance} km`, 10, 20);
    doc.text(`Safety Margin: ${lastResults.safetyMargin} dB`, 10, 30);

    doc.text('Component Losses:', 10, 40);
    doc.text(`Fiber Attenuation: ${lastResults.totalFiberLoss} dB`, 10, 50);
    doc.text(`Splice Loss: ${lastResults.totalSpliceLoss} dB`, 10, 60);
    doc.text(`Connector Loss: ${lastResults.totalConnectorLoss} dB`, 10, 70);
    doc.text(`Total Loss: ${lastResults.totalLoss} dB`, 10, 80);

    doc.text('Budget Analysis:', 10, 90);
    doc.text(`25G: Budget ${lastResults.budgets['25G']} dB, Margin ${(lastResults.budgets['25G'] - lastResults.totalLoss).toFixed(2)} dB`, 10, 100);
    doc.text(`50G: Budget ${lastResults.budgets['50G']} dB, Margin ${(lastResults.budgets['50G'] - lastResults.totalLoss).toFixed(2)} dB`, 10, 110);
    doc.text(`100G: Budget ${lastResults.budgets['100G']} dB, Margin ${(lastResults.budgets['100G'] - lastResults.totalLoss).toFixed(2)} dB`, 10, 120);

    doc.save('loss-budget.pdf');
}

// Copy Results (Unchanged, but added inline confirmation)
function copyResults() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    document.getElementById('validation-summary').textContent = 'Results copied to clipboard!';
    setTimeout(() => document.getElementById('validation-summary').textContent = '', 2000); // Clear after 2s
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
    lastResults = null; // Clear for PDF
    validateAndToggleButton();
}

// Tab Switching (Unchanged)
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
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

    // Add event listeners for real-time validation on input change/blur
    document.querySelector('#calculator').addEventListener('input', validateAndToggleButton);
    document.querySelector('#calculator').addEventListener('blur', validateAndToggleButton, true);

    // Event delegation for tab clicks (extra reliability)
    document.querySelector('.tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-button')) {
            const tabName = e.target.getAttribute('onclick').match(/'(\w+)'/)[1];
            openTab(tabName);
        }
    });

    // Image check
    const img = document.getElementById('otdr-image');
    img.onerror = () => {
        img.style.display = 'none';
        document.getElementById('image-fallback').style.display = 'block';
    };
});
