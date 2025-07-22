from pyscript import document
import asyncio

# The standards data remains the same
FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25}
    },
    'OM3': { 'name': 'Multimode OM3', 'max_distance_m': 300, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}},
    'OM4': { 'name': 'Multimode OM4', 'max_distance_m': 400, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}},
    'OM5': { 'name': 'Multimode OM5', 'max_distance_m': 440, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}}
}

def calculate_and_display(event):
    """
    This function is called when the 'Calculate' button is clicked.
    It reads values from the HTML inputs, performs the calculation,
    and displays the results as structured HTML in the output div.
    """
    output_div = document.querySelector("#results-output")
    try:
        fiber_type = document.querySelector("#fiber_type").value
        distance_m = float(document.querySelector("#distance").value)
        splice_count = int(document.querySelector("#splice_count").value)
        connector_count = int(document.querySelector("#connector_count").value)
        
        params = FIBER_STANDARDS[fiber_type]
        
        # Check length constraint
        max_dist = params['max_distance_m']
        if distance_m > max_dist:
            output_div.innerHTML = f"""
                <div class='result-warn'>Length Error:</div>
                <div>The entered distance of {distance_m}m exceeds the recommended maximum of {max_dist}m for {fiber_type}.</div>
            """
            return

        # Build the result HTML string
        result_html = f"<div class='result-header'>📊 Link Budget for {params['name']}</div>"

        for wl, atten in params['wavelengths'].items():
            max_loss = (distance_m / 1000 * atten['max_attenuation_db_km']) + (splice_count * params['splice_loss']['max_db']) + (connector_count * params['connector_loss']['max_db'])
            typ_loss = (distance_m / 1000 * atten['typical_attenuation_db_km']) + (splice_count * params['splice_loss']['typical_db']) + (connector_count * params['connector_loss']['typical_db'])
            
            result_html += f"""
                <div class='result-block'>
                    <div class='result-header'>📈 Results for Wavelength: {wl}</div>
                    <div><span class='result-label'>Max Acceptable Loss:</span> <span class='result-pass'>{max_loss:.2f} dB</span></div>
                    <div><span class='result-label'>Typical Good Performance:</span> {typ_loss:.2f} dB</div>
                </div>
            """
        
        # Display the result in the output div
        output_div.innerHTML = result_html

    except ValueError:
        output_div.innerHTML = "<div class='result-warn'>❌ Input Error: Please ensure all fields have valid numbers.</div>"
    except Exception as e:
        output_div.innerHTML = f"<div class='result-warn'>An unexpected error occurred: {e}</div>"

def main():
    # Get a reference to the button and add a click event listener
    calculate_button = document.querySelector("#calculate_button")
    calculate_button.addEventListener("click", calculate_and_display)

# Run the main function to set up the event listener
main()