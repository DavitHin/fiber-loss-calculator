document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Logic ---
    const modal = document.getElementById('readme-modal');
    const readmeBtn = document.getElementById('readme-button');
    const closeBtn = document.querySelector('.close-button');

    readmeBtn.onclick = () => { modal.style.display = 'block'; };
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- Font Size Logic ---
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const root = document.documentElement;

    let currentFontSize = 16;
    root.style.setProperty('--font-size', `${currentFontSize}px`);

    fontIncreaseBtn.onclick = () => {
        if (currentFontSize < 22) { // Max size
            currentFontSize += 1;
            root.style.setProperty('--font-size', `${currentFontSize}px`);
        }
    };
    
    fontDecreaseBtn.onclick = () => {
        if (currentFontSize > 12) { // Min size
            currentFontSize -= 1;
            root.style.setProperty('--font-size', `${currentFontSize}px`);
        }
    };

    // --- Image Click Logic ---
    const image = document.getElementById('otdr-image');
    if (image) {
        image.onclick = () => {
            // Check if the image source is a real file, not a placeholder
            if (image.src && !image.src.includes('data:image')) {
                 window.open(image.src, '_blank');
            }
        };
    }
});