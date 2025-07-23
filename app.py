# app.py
# Fiber Optic Link Loss Budget Web Calculator
# Version: 5.1 (Adapted for Web with Streamlit)
# Date: 2024-10 (Ported by Grok)
# Original Author: Gemini (AI Assistant)

import streamlit as st
from PIL import Image  # For image handling (optional, but preserved)
import os

# --- Data Store (Preserved exactly) ---
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

# Custom CSS for themes and font size (to preserve dynamic font and styles)
def apply_custom_css(font_size, is_dark_mode):
    theme_colors = {
        "bg": "#2E2E2E" if is_dark_mode else "#F0F0F0",
        "fg": "#FFFFFF" if is_dark_mode else "#000000",
        "header_fg": "#569CD6" if is_dark_mode else "#003399",
        "link_fg": "#6CB4EE" if is_dark_mode else "#0000EE",
        "pass_fg": "#3CB371",
        "warn_fg": "#FFA500"
    }
    st.markdown(f"""
        <style>
            .content-text {{
                font-size: {font_size}px !important;
                color: {theme_colors['fg']};
            }}
            .h1 {{ font-size: {font_size + 2}px; font-weight: bold; color: {theme_colors['header_fg']}; }}
            .h2 {{ font-size: {font_size + 1}px; font-weight: bold; color: {theme_colors['header_fg']}; }}
            .bold {{ font-weight: bold; }}
            .pass {{ color: {theme_colors['pass_fg']}; }}
            .warn {{ color: {theme_colors['warn_fg']}; }}
            a {{ color: {theme_colors['link_fg']}; text-decoration: underline; }}
        </style>
    """, unsafe_allow_html=True)

# Main app
st.title("Advanced Fiber Optic Loss Budget Calculator")

# Session state for preserving inputs across interactions
if 'distance' not in st.session_state:
    st.session_state.distance = 0.0
if 'splice_count' not in st.session_state:
    st.session_state.splice_count = 0
if 'connector_count' not in st.session_state:
    st.session_state.connector_count = 0
if 'output' not in st.session_state:
    st.session_state.output = ""
if 'font_size' not in st.session_state:
    st.session_state.font_size = 14  # Default larger for web readability
if 'is_dark_mode' not in st.session_state:
    st.session_state.is_dark_mode = False

# Control bar (preserved)
col1, col2, col3 = st.columns([1, 1, 2])
with col1:
    if st.button("Readme & Links"):
        with st.expander("Readme & Standards Information", expanded=True):
            st.markdown("""
                <div class="content-text">
                <span class="h1">Standards & References</span><br><br>
                This calculator uses parameters from major industry standards.<br><br>
                <span class="h2">Official Standards</span><br>
                ▪ ITU-T G.652: Defines attenuation (dB/km) for single-mode fiber.<br>
                &nbsp;&nbsp;<a href="https://www.itu.int/rec/T-REC-G.652" target="_blank">View Standard</a><br><br>
                ▪ TIA-568 Series: Sets max loss for connectors (0.75 dB) and splices (0.3 dB).<br>
                &nbsp;&nbsp;<a href="https://www.tiaonline.org/products-and-services/standards/" target="_blank">View Publisher</a><br><br>
                ▪ ISO/IEC 11801: The international equivalent of TIA-568.<br>
                &nbsp;&nbsp;<a href="https://www.iso.org/committee/45838.html" target="_blank">View Committee</a><br><br>
                <span class="h2">Additional Learning Resources</span><br>
                ▪ Understanding Fiber Loss Calculation<br>
                &nbsp;&nbsp;<a href="https://www.fs.com/blog/understanding-fiber-loss-what-is-it-and-how-to-calculate-it-3792.html" target="_blank">Read on FS.com</a><br><br>
                ▪ Single-Mode vs. Multi-Mode Fiber Types<br>
                &nbsp;&nbsp;<a href="https://www.fs.com/blog/fiber-optic-cable-types-single-mode-vs-multimode-fiber-cable-1310.html" target="_blank">Read on FS.com</a>
                </div>
            """, unsafe_allow_html=True)
with col2:
    dark_mode = st.checkbox("Dark Mode", value=st.session_state.is_dark_mode)
    if dark_mode != st.session_state.is_dark_mode:
        st.session_state.is_dark_mode = dark_mode
        st.rerun()  # Rerun to apply theme immediately
with col3:
    font_size = st.slider("Content Font Size", min_value=8, max_value=20, value=st.session_state.font_size)
    if font_size != st.session_state.font_size:
        st.session_state.font_size = font_size
        st.rerun()  # Rerun to apply font size

# Apply theme and font (preserved)
apply_custom_css(st.session_state.font_size, st.session_state.is_dark_mode)

# Tabs (preserved)
tab1, tab2 = st.tabs(["Loss Calculator", "OTDR Guide"])

with tab1:
    st.markdown('<div class="content-text">', unsafe_allow_html=True)  # Wrap content for font styling

    # Inputs (preserved)
    fiber_type = st.selectbox("Fiber Type:", options=list(FIBER_STANDARDS.keys()), index=0)
    st.session_state.distance = st.number_input("Distance (meters):", min_value=0.0, value=st.session_state.distance)
    st.session_state.splice_count = st.number_input("Splice Count:", min_value=0, value=st.session_state.splice_count, step=1)
    st.session_state.connector_count = st.number_input("Connector Count:", min_value=0, value=st.session_state.connector_count, step=1)

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        if st.button("Calculate"):
            try:
                params = FIBER_STANDARDS[fiber_type]
                distance_m = st.session_state.distance
                splice_count = st.session_state.splice_count
                connector_count = st.session_state.connector_count

                max_dist = params['max_distance_m']
                if distance_m > max_dist:
                    st.error(f"The entered distance of {distance_m}m exceeds the recommended maximum of {max_dist}m for {fiber_type}. Please enter a valid length.")
                else:
                    output = '<span class="h1">📊 Link Loss Budget Results</span><br><br>'
                    output += f'<span class="bold">Fiber Type: </span>{params["name"]}<br>'
                    output += "--------------------------------------------------------<br>"

                    for wl, atten in params['wavelengths'].items():
                        max_loss = (distance_m / 1000 * atten['max_attenuation_db_km']) + (splice_count * params['splice_loss']['max_db']) + (connector_count * params['connector_loss']['max_db'])
                        typ_loss = (distance_m / 1000 * atten['typical_attenuation_db_km']) + (splice_count * params['splice_loss']['typical_db']) + (connector_count * params['connector_loss']['typical_db'])
                        output += f'<span class="h2">📈 Results for Wavelength: {wl}</span><br>'
                        output += '<span class="bold">  - Highest Acceptable Loss: </span><span class="pass">{:.2f} dB</span><br>'.format(max_loss)
                        output += '<span class="bold">  - Typical Good Performance: </span>{:.2f} dB<br>'.format(typ_loss)
                        output += "--------------------------------------------------------<br>"

                    st.session_state.output = output
            except ValueError:
                st.error("Please enter valid numbers for distance, splices, and connectors.")
    with col_btn2:
        if st.button("Clear"):
            st.session_state.distance = 0.0
            st.session_state.splice_count = 0
            st.session_state.connector_count = 0
            st.session_state.output = ""
            st.rerun()  # Refresh to clear

    # Output (preserved as markdown for formatting)
    if st.session_state.output:
        st.markdown(st.session_state.output, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

with tab2:
    st.markdown('<div class="content-text">', unsafe_allow_html=True)

    # Image (preserved; display with download option instead of open; cloud-friendly path)
    image_path = "otdr_example.png"  # Relative to repo root
    if os.path.exists(image_path):
        try:
            img = Image.open(image_path)
            st.image(img, caption="Example OTDR Trace (Click Download to Save)", use_column_width=True)
            with open(image_path, "rb") as file:
                st.download_button(label="Download OTDR Image", data=file, file_name="otdr_example.png", mime="image/png")
        except Exception as e:
            st.warning(f"Error loading image: {str(e)}. Ensure 'otdr_example.png' is uploaded to the repo.")
    else:
        st.warning("Image 'otdr_example.png' not found in the repo. Upload it to display here.")

    # Instructions (preserved with markdown)
    st.markdown("""
        <span class="h1">Reading an OTDR Trace: A Step-by-Step Guide</span><br><br>
        <span class="h2">Which Wavelength Report to Use?</span><br>
        <span class="bold">▪ Single-Mode (OS2): </span>Always use the 1550nm report as your reference. It is more sensitive to bends and losses, giving you the most accurate splice count for your budget.<br>
        <span class="bold">▪ Multi-Mode (OMx): </span>Use the 850nm report. This is the primary transmission wavelength and its higher natural loss provides a 'worst-case' scenario for a safe, conservative budget.<br><br>
        <span class="h2">Key Features to Identify (using an OS2 1550nm report as an example):</span><br>
        <span class="bold">1. Fusion Splices (e.g., Event 3 at 2820.13m)</span><br>
        A small, sharp drop with no reflection. A loss of <0.1 dB (like 0.042 dB) is a high-quality splice.<br><br>
        <span class="bold">2. End of Fiber (e.g., Event 8 at 7822.36m)</span><br>
        The final event is a large reflective spike, marking the end of the line.
    """, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)
