const FIBER_STANDARDS = {
    'OS2': {
        name: 'Single-Mode (ITU-T G.652.D)', max_distance_m: 10000,
        wavelengths: {
            '1310nm': { max_attenuation_db_km: 0.4, typical_attenuation_db_km: 0.35 },
            '1550nm': { max_attenuation_db_km: 0.3, typical_attenuation_db_km: 0.22 }
        },
        splice_loss: { max_db: 0.3, typical_db: 0.05 },
        connector_loss: { max_db: 0.75, typical_db: 0.25 }
    },
    'OM3': {
        name: 'Multimode OM3', max_distance_m: 300,
        wavelengths: {
            '850nm': { max_attenuation_db_km: 3.0, typical_attenuation_db_km: 2.5 },
            '1300nm': { max_attenuation_db_km: 1.5, typical_attenuation_db_km: 0.8 }
        },
        splice_loss: { max_db: 0.3, typical_db: 0.1 },
        connector_loss: { max_db: 0.75, typical_db: 0.3 }
    },
    'OM4': {
        name: 'Multimode OM4', max_distance_m: 400,
        wavelengths: {
            '850nm': { max_attenuation_db_km: 3.0, typical_attenuation_db_km: 2.5 },
            '1300nm': { max_attenuation_db_km: 1.5, typical_attenuation_db_km: 0.8 }
        },
        splice_loss: { max_db: 0.3, typical_db: 0.1 },
        connector_loss: { max_db: 0.75, typical_db: 0.3 }
    },
    'OM5': {
        name: 'Multimode OM5', max_distance_m: 440,
        wavelengths: {
            '850nm': { max_attenuation_db_km: 3.0, typical_attenuation_db_km: 2.4 },
            '953nm': { max_attenuation_db_km: 2.2, typical_attenuation_db_km: 1.9 }
        },
        splice_loss: { max_db: 0.3, typical_db: 0.1 },
        connector_loss: { max_db: 0.75, typical_db: 0.3 }
    }
};

const LossCalculatorApp = () => {
    const [fiberType, setFiberType] = React.useState('OS2');
    const [distance, setDistance] = React.useState('');
    const [spliceCount, setSpliceCount] = React.useState('');
    const [connectorCount, setConnectorCount] = React.useState('');
    const [fontSize, setFontSize] = React.useState(16);
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('calculator');
    const [results, setResults] = React.useState('');
    const [showReadme, setShowReadme] = React.useState(false);

    const theme = isDarkMode
        ? { bg: 'bg-gray-800', fg: 'text-white', entryBg: 'bg-gray-700', textBg: 'bg-gray-900', headerFg: 'text-blue-400', linkFg: 'text-blue-300' }
        : { bg: 'bg-gray-100', fg: 'text-black', entryBg: 'bg-white', textBg: 'bg-white', headerFg: 'text-blue-800', linkFg: 'text-blue-600' };

    const handleCalculate = () => {
        try {
            const params = FIBER_STANDARDS[fiberType];
            const distance_m = parseFloat(distance);
            const splices = parseInt(spliceCount);
            const connectors = parseInt(connectorCount);

            if (isNaN(distance_m) || isNaN(splices) || isNaN(connectors)) {
                alert('Please enter valid numbers for distance, splices, and connectors.');
                return;
            }

            if (distance_m > params.max_distance_m) {
                alert(`The entered distance of ${distance_m}m exceeds the recommended maximum of ${params.max_distance_m}m for ${fiberType}.`);
                return;
            }

            let output = `📊 Link Loss Budget Results\n\n**Fiber Type:** ${params.name}\n${'-'.repeat(50)}\n`;
            for (const [wl, atten] of Object.entries(params.wavelengths)) {
                const maxLoss = (distance_m / 1000 * atten.max_attenuation_db_km) +
                    (splices * params.splice_loss.max_db) +
                    (connectors * params.connector_loss.max_db);
                const typLoss = (distance_m / 1000 * atten.typical_attenuation_db_km) +
                    (splices * params.splice_loss.typical_db) +
                    (connectors * params.connector_loss.typical_db);
                output += `📈 **Results for Wavelength: ${wl}**\n  - **Highest Acceptable Loss:** ${maxLoss.toFixed(2)} dB\n  - **Typical Good Performance:** ${typLoss.toFixed(2)} dB\n${'-'.repeat(50)}\n`;
            }
            setResults(output);
        } catch (error) {
            alert('Input Error: Please enter valid numbers.');
        }
    };

    const handleClear = () => {
        setDistance('');
        setSpliceCount('');
        setConnectorCount('');
        setResults('');
    };

    const openLink = (url) => window.open(url, '_blank');

    const readmeContent = (
        <div className={`fixed inset-0 ${theme.bg} ${theme.fg} p-4 overflow-auto`} style={{ fontSize: `${fontSize}px` }}>
            <div className="max-w-2xl mx-auto bg-opacity-90">
                <h1 className={`text-xl font-bold ${theme.headerFg} mb-4`}>Standards & References</h1>
                <p>This calculator uses parameters from major industry standards.</p>
                <h2 className="text-lg font-bold mt-4">Official Standards</h2>
                <ul className="list-disc ml-6">
                    <li>ITU-T G.652: Defines attenuation (dB/km) for single-mode fiber. <a className={`link ${theme.linkFg}`} onClick={() => openLink('https://www.itu.int/rec/T-REC-G.652')}>View Standard</a></li>
                    <li>TIA-568 Series: Sets max loss for connectors (0.75 dB) and splices (0.3 dB). <a className={`link ${theme.linkFg}`} onClick={() => openLink('https://www.tiaonline.org/products-and-services/standards/')}>View Publisher</a></li>
                    <li>ISO/IEC 11801: The international equivalent of TIA-568. <a className={`link ${theme.linkFg}`} onClick={() => openLink('https://www.iso.org/committee/45838.html')}>View Committee</a></li>
                </ul>
                <h2 className="text-lg font-bold mt-4">Additional Learning Resources</h2>
                <ul className="list-disc ml-6">
                    <li>Understanding Fiber Loss Calculation <a className={`link ${theme.linkFg}`} onClick={() => openLink('https://www.fs.com/blog/understanding-fiber-loss-what-is-it-and-how-to-calculate-it-3792.html')}>Read on FS.com</a></li>
                    <li>Single-Mode vs. Multi-Mode Fiber Types <a className={`link ${theme.linkFg}`} onClick={() => openLink('https://www.fs.com/blog/fiber-optic-cable-types-single-mode-vs-multimode-fiber-cable-1310.html')}>Read on FS.com</a></li>
                </ul>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowReadme(false)}>Close</button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.fg} p-4`} style={{ fontSize: `${fontSize}px` }}>
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-2xl font-bold ${theme.headerFg} mb-4`}>Advanced Fiber Optic Loss Budget Calculator</h1>
                <div className="flex items-center mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded mr-4" onClick={() => setShowReadme(true)}>Readme & Links</button>
                    <label className="flex items-center mr-4">
                        <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} className="mr-2" />
                        Dark Mode
                    </label>
                    <div className="flex items-center">
                        <span className="mr-2">Content Font Size:</span>
                        <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setFontSize(Math.max(12, fontSize - 1))}>-</button>
                        <input
                            type="range"
                            min="12"
                            max="20"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="mx-2"
                        />
                        <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setFontSize(Math.min(20, fontSize + 1))}>+</button>
                    </div>
                </div>
                <div className="flex border-b">
                    <button
                        className={`px-4 py-2 ${activeTab === 'calculator' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('calculator')}
                    >
                        Loss Calculator
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'otdr' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('otdr')}
                    >
                        OTDR Guide
                    </button>
                </div>
                <div className="mt-4">
                    <div className={`tab-content ${activeTab === 'calculator' ? 'active' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border p-4 rounded">
                                <h2 className={`text-lg font-bold ${theme.headerFg}`}>Input Parameters</h2>
                                <div className="mt-2">
                                    <label className="block">Fiber Type:</label>
                                    <select
                                        value={fiberType}
                                        onChange={(e) => setFiberType(e.target.value)}
                                        className={`w-full p-2 ${theme.entryBg} ${theme.fg} border rounded`}
                                    >
                                        {Object.keys(FIBER_STANDARDS).map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-2">
                                    <label className="block">Distance (meters):</label>
                                    <input
                                        type="text"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        className={`w-full p-2 ${theme.entryBg} ${theme.fg} border rounded`}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className="block">Splice Count:</label>
                                    <input
                                        type="text"
                                        value={spliceCount}
                                        onChange={(e) => setSpliceCount(e.target.value)}
                                        className={`w-full p-2 ${theme.entryBg} ${theme.fg} border rounded`}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className="block">Connector Count:</label>
                                    <input
                                        type="text"
                                        value={connectorCount}
                                        onChange={(e) => setConnectorCount(e.target.value)}
                                        className={`w-full p-2 ${theme.entryBg} ${theme.fg} border rounded`}
                                    />
                                </div>
                                <div className="mt-4">
                                    <button className="px-4 py-2 bg-blue-500 text-white rounded mr-2" onClick={handleCalculate}>Calculate</button>
                                    <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={handleClear}>Clear</button>
                                </div>
                            </div>
                            <div className="border p-4 rounded">
                                <h2 className={`text-lg font-bold ${theme.headerFg}`}>Results</h2>
                                <pre className={`scrollable-text p-2 ${theme.textBg} ${theme.fg} border rounded`}>{results}</pre>
                            </div>
                        </div>
                    </div>
                    <div className={`tab-content ${activeTab === 'otdr' ? 'active' : ''}`}>
                        <div className="border p-4 rounded mb-4">
                            <h2 className={`text-lg font-bold ${theme.headerFg}`}>Example OTDR Trace</h2>
                            <p>OTDR image display is not supported in this web version. Place 'otdr_example.png' in your project folder and serve it via a web server to view.</p>
                        </div>
                        <div className="border p-4 rounded">
                            <h2 className={`text-lg font-bold ${theme.headerFg}`}>How to Read the Report</h2>
                            <div className="scrollable-text">
                                <h3 className={`text-xl font-bold ${theme.headerFg}`}>Reading an OTDR Trace: A Step-by-Step Guide</h3>
                                <h4 className="text-lg font-bold mt-2">Which Wavelength Report to Use?</h4>
                                <p><strong>▪ Single-Mode (OS2):</strong> Always use the 1550nm report as your reference. It is more sensitive to bends and losses, giving you the most accurate splice count for your budget.</p>
                                <p><strong>▪ Multi-Mode (OMx):</strong> Use the 850nm report. This is the primary transmission wavelength and its higher natural loss provides a 'worst-case' scenario for a safe, conservative budget.</p>
                                <h4 className="text-lg font-bold mt-2">Key Features to Identify (using an OS2 1550nm report as an example):</h4>
                                <p><strong>1. Fusion Splices (e.g., Event 3 at 2820.13m)</strong><br />A small, sharp drop with no reflection. A loss of - 0.1 dB (like 0.042 dB) is a high-quality splice.</p>
                                <p><strong>2. End of Fiber (e.g., Event 8 at 7822.36m)</strong><br />The final event is a large reflective spike, marking the end of the line.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showReadme && readmeContent}
        </div>
    );
};

ReactDOM.render(<LossCalculatorApp />, document.getElementById('root'));