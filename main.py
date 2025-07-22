from pyscript import document

# --- Data Store (Unchanged) ---
FIBER_STANDARDS = {
    'OS2': {'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000, 'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25}},
    'OM3': {'name': 'Multimode OM3', 'max_distance_m': 300, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}},
    'OM4': {'name': 'Multimode OM4', 'max_distance_m': 400, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}},
    'OM5': {'name': 'Multimode OM5', 'max_distance_m': 440, 'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}}, 'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}}
}

def populate_instructions():
    instr_div = document.querySelector("#instructions-output")
    content = """Which Wavelength Report to Use?
-----------------------------
▪ Single-Mode (OS2):
  Always use the 1550nm report as your reference. It is more sensitive to bends and losses, giving the most accurate splice count.

▪ Multi-Mode (OMx):
  Use the 850nm report. This is the primary transmission wavelength and its higher natural loss provides a 'worst-case' scenario for a safe, conservative budget.

Key Features to Identify
-----------------------------
1. Fusion Splices:
   A small, sharp drop with no reflection. A loss of <0.1 dB is excellent.

2. End of Fiber:
   The final event is a large reflective spike, marking the end of the line.
"""
    instr_div.innerText = content

def populate_readme():
    readme_div = document.querySelector("#readme-text")
    content = """
    <h2>Standards & References</h2>
    <p>This calculator uses parameters from major industry standards.</p>
    
    <h3>Official Standards</h3>
    <p>▪ <b>ITU-T G.652:</b> Defines attenuation (dB/km) for single-mode fiber.<br>
       <a href="https://www.itu.int/rec/T-REC-G.652" target="_blank">View Standard</a></p>
    <p>▪ <b>TIA-568 Series:</b> Sets max loss for connectors (0.75 dB) and splices (0.3 dB).<br>
       <a href="https://www.tiaonline.org/products-and-services/standards/" target="_blank">View Publisher</a></p>
    <p>▪ <b>ISO/IEC 11801:</b> The international equivalent of TIA-568.<br>
       <a href="https://www.iso.org/committee/45838.html" target="_blank">View Committee</a></p>

    <h3>Additional Learning Resources</h3>
    <p>▪ Understanding Fiber Loss Calculation<br>
       <a href="https://www.fs.com/blog/understanding-fiber-loss-what-is-it-and-how-to-calculate-it-3792.html" target="_blank">Read on FS.com</a></p>
    <p>▪ Single-Mode vs. Multi-Mode Fiber Types<br>
       <a href="https://www.fs.com/blog/fiber-optic-cable-types-single-mode-vs-multimode-fiber-cable-1310.html" target="_blank">Read on FS.com</a></p>
    """
    readme_div.innerHTML = content

def calculate_and_display(*args, **kwargs):
    output_div = document.querySelector("#results-output")
    try:
        fiber_type = document.querySelector("#fiber_type").value
        distance_m = float(document.querySelector("#distance").value)
        splice_count = int(document.querySelector("#splice_count").value)
        connector_count = int(document.querySelector("#connector_count").value)
        
        params = FIBER_STANDARDS[fiber_type]
        max_dist = params['max_distance_m']
        if distance_m > max_dist:
            alert_text = f"Length Error: The entered distance of {distance_m}m exceeds the recommended maximum of {max_dist}m for {fiber_type}."
            document.querySelector("#results-output").innerText = f"❌ {alert_text}"
            return

        result_text = f"📊 Link Loss Budget for {params['name']}\n"
        result_text += "--------------------------------------\n\n"
        for wl, atten in params['wavelengths'].items():
            max_loss = (distance_m / 1000 * atten['max_attenuation_db_km']) + (splice_count * params['splice_loss']['max_db']) + (connector_count * params['connector_loss']['max_db'])
            typ_loss = (distance_m / 1000 * atten['typical_attenuation_db_km']) + (splice_count * params['splice_loss']['typical_db']) + (connector_count * params['connector_loss']['typical_db'])
            result_text += f"📈 Results for Wavelength: {wl}\n"
            result_text += f"  - Max Acceptable Loss: {max_loss:.2f} dB\n"
            result_text += f"  - Typical Good Performance: {typ_loss:.2f} dB\n\n"
        
        output_div.innerText = result_text

    except ValueError:
        output_div.innerText = "❌ Input Error: Please ensure all fields have valid numbers."
    except Exception as e:
        output_div.innerText = f"An unexpected error occurred: {e}"

# --- Run initial setup functions when script loads ---
populate_instructions()
populate_readme()