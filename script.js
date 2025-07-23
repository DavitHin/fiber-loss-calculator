// Data Store (Updated with 100G Budgets - Approximate from IEEE 802.3 for 100GBASE)
const FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25},
        'budgets': {'100G': 5} // Approx for 100GBASE-LR4 (long reach SMF; verify standards)
    },
    'OM3': {
        'name': 'Multimode OM3', 'max_distance_m': 300,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'100G': 1.5} // Approx for 100GBASE-SR4 (short reach MMF)
    },
    'OM4': {
        'name': 'Multimode OM4', 'max_distance_m': 400,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'100G': 1.5}
    },
    'OM5': {
        'name': 'Multimode OM5', 'max_distance_m': 440,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3},
        'budgets': {'100G': 1.5}
    }
};

// Segment Management (Unchanged from last full version)

// ... (addSegment, removeSegment, renderSegments, saveSegmentData, updateWavelengthOptions, toggleCustomInputs unchanged)

// Inline Validation and Button Toggle (Updated for no popups, disabled button, inline remarks)
function validateAndToggleButton() {
    let valid = true;
    // Clear all errors first
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('validation-summary').textContent = '';

    // Validate per-segment inputs
    for (let i = 1; i <= segments; i++) {
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

// Calculation (Updated to 100G default)
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

        if (distance > params.max_distance_m / 1000) {
            document.getElementById(`distance-${segId}-error`).textContent = `Exceeds max for ${fiberType} (${params.max_distance_m / 1000} km).`;
            validateAndToggleButton(); // Re-validate to disable button
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

    // 100G budget (use first segment's fiber)
    const firstFiber = document.getElementById('fiber-type-1').value;
    const budget = FIBER_STANDARDS[firstFiber].budgets['100G'];
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
    output += `<p>Budget (100G Ethernet Example): ${budget} dB | Margin: ${margin.toFixed(2)} dB | Status: ${status}</p>`;
    output += '<p><em>Values based on standards; <a href="#" onclick="showReadme()">verify in Readme</a>.</em></p>';
    output += '<canvas id="loss-chart"></canvas>';

    document.getElementById('output').innerHTML = output;
    drawChart(totalFiberLoss, totalSpliceLoss, totalConnectorLoss, safetyMargin);
}

// ... (The rest of the code is unchanged from the full version I provided in my last response. To avoid repetition, paste the full script.js from my previous message here, but replace the budgets with the updated ones above and the calculation section with this 100G version.)

// Initialize (Added event delegation for tabs to ensure clickability)
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
