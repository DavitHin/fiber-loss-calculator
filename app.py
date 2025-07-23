from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Fiber standards data (unchanged from original)
FIBER_STANDARDS = {
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
}

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            fiber_type = request.form['fiber_type']
            distance = float(request.form['distance'])
            splices = int(request.form['splices'])
            connectors = int(request.form['connectors'])
            params = FIBER_STANDARDS[fiber_type]
            max_dist = params['max_distance_m']
            if distance > max_dist:
                return jsonify({'error': f'Distance {distance}m exceeds max {max_dist}m for {fiber_type}'})
            results = calculate_loss(fiber_type, distance, splices, connectors)
            return jsonify(results)
        except ValueError:
            return jsonify({'error': 'Invalid input: Please enter numeric values'})
    return render_template('index.html', fiber_types=FIBER_STANDARDS.keys())

@app.route('/instructions')
def instructions():
    return render_template('instructions.html')

def calculate_loss(fiber_type, distance, splices, connectors):
    params = FIBER_STANDARDS[fiber_type]
    results = {'fiber_type': params['name'], 'wavelengths': {}}
    for wl, atten in params['wavelengths'].items():
        max_loss = (distance / 1000 * atten['max_attenuation_db_km']) + (splices * params['splice_loss']['max_db']) + (connectors * params['connector_loss']['max_db'])
        typ_loss = (distance / 1000 * atten['typical_attenuation_db_km']) + (splices * params['splice_loss']['typical_db']) + (connectors * params['connector_loss']['typical_db'])
        results['wavelengths'][wl] = {'max_loss': round(max_loss, 2), 'typ_loss': round(typ_loss, 2)}
    return results

if __name__ == '__main__':
    app.run(debug=True)