# Fiber Loss Calculator

A web-based tool for calculating fiber optic link loss budgets, with an OTDR guide for reading test results. Built with HTML/CSS/JS for GitHub Pages—accessible on any device via browser.

## Features
- **Loss Calculator**: Input fiber type, distance, splices, connectors, and custom values. Supports multi-segments (up to 3). Shows detailed breakdown, budgets (25G/50G/100G Ethernet), and Pass/Fail status.
- **OTDR Guide**: Educational tab with how-to-read instructions and example trace.
- **Customization**: Dark mode (default), font size slider.
- **Copy Results**: Copy calculated results to clipboard.
- **Validation**: Inline error messages for invalid inputs (no popups).
- **Responsive**: Works on desktop/mobile.

## Usage
1. Open https://davithin.github.io/fiber-loss-calculator/ in your browser.
2. In "Loss Calculator" tab:
   - Add segments if needed.
   - Fill fields (fiber type, wavelength, distance, etc.).
   - Toggle custom losses for overrides.
   - Click "Calculate" (disabled if invalid).
   - View results, budgets, and chart.
   - Copy results.
3. In "OTDR Guide" tab: Read explanations and enlarge the example image.

## How to Read OTDR Results (Full Guide)
OTDR traces map fiber links. Example (1550nm trace, ~7.82 km):
- **Event 1 (0m, loss blank, reflectance -31.82 dB)**: Launch connector—baseline.
- **Event 2 (216.93m, loss 0.064 dB, reflectance blank)**: Fusion splice.
- **Event 3 (2820.13m, loss 0.042 dB, reflectance blank)**: Fusion splice.
- **Event 4 (4741.9m, loss -0.078 dB, reflectance blank)**: Gain artifact (mismatch).
- **Event 5 (5016.26m, loss 0.111 dB, reflectance blank)**: Fusion splice.
- **Event 6 (7001.84m, loss 0.183 dB, reflectance blank)**: Fusion splice (check high loss).
- **Event 7 (7822.36m, loss 0.183 dB, reflectance blank)**: Splice or bend.
- **Event 8 (7822.36m, loss 0.150 dB, reflectance blank)**: End of fiber (total 1.668 dB).

For details, see the app's OTDR tab.

## Standards & References
- ITU-T G.652: [View (Free PDF)](https://www.itu.int/rec/T-REC-G.652-201611-I/en)
- TIA-568: [View](https://global.ihs.com/standards/tia/tia-568?search=true)
- ISO/IEC 11801: [View](https://www.iso.org/standard/76114.html)
- IEEE 802.3 (Budgets): [View](https://standards.ieee.org/ieee/802.3/6943/)

## Deployment
Hosted on GitHub Pages. To run locally:
1. Clone repo: `git clone https://github.com/DavitHin/fiber-loss-calculator.git`
2. Open `index.html` in browser.

## Troubleshooting
- Clear browser cache if issues.
- For bugs, check console (F12) and open an issue.

Built with ❤️ by DavitHin, assisted by Grok.
