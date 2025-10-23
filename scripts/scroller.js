const mainHeader = document.getElementById('mainHeader');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const content = document.getElementById('content');
const heading = document.getElementById('heading');
const body = document.body;


const basePadding = 40;
const maxPadding = 120;
const threshold = 80;

const gridWidth = 100;
const gridHeight = 30;
const totalPixels = gridWidth * gridHeight;

// Color sets: [background, text]
const colorSets = [
    ['#FF6542', '#393939'], // Yellow / Dark Gray
    ['#E80051', '#FFFFFF'], // Red / White
    ['#F6AD00', '#FFF1D0'], // Royal Blue / White
    ['#009B72', '#393939'], // Lime Green / Almost Black
    ['#393939', '#FFFFED'],
    ['#9747FF', '#FFFFED'],
    ['#0017E8', '#FFFFED'],
    ['#FF12AF', '#FFFFED'],
];

const colorSets2 = [
    ['#FFD700', '#333333'], // Yellow / Dark Gray
    ['#FF4444', '#FFFFFF'], // Red / White
    ['#4169E1', '#FFFFFF'], // Royal Blue / White
    ['#32CD32', '#1A1A1A'], // Lime Green / Almost Black
    ['#FF1493', '#FFFFFF'], // Deep Pink / White
    ['#9370DB', '#FFFFFF'], // Medium Purple / White
    ['#FF6347', '#FFFFFF'], // Tomato / White
    ['#20B2AA', '#FFFFFF'], // Light Sea Green / White
    ['#FF8C00', '#1A1A1A'], // Dark Orange / Almost Black
    ['#8B4513', '#FFFFFF']  // Saddle Brown / White
];

// Headings list
const headings = [
    'software is eating the world',
    'finding my place between beauty and practicality',
    'make beautiful things',
    'autodidactic',
    'designing with craft and compassion'
];

let pixelStates = [];
let pixelOrder = [];

let startY = 0;
let currentPull = 0;
let isAtTop = false;
let reachedThreshold = false;

let currentSetIndex = 0;
let nextSetIndex = 0;

// Initialize pixel states and create random order
function initPixels() {
    pixelStates = new Array(totalPixels).fill(0); // 0 = current color, 1 = next color
    pixelOrder = Array.from({length: totalPixels}, (_, i) => i);
    
    // Shuffle the order for random pixel transitions
    for (let i = pixelOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pixelOrder[i], pixelOrder[j]] = [pixelOrder[j], pixelOrder[i]];
    }
}

// Get random index excluding current
function getRandomIndex(currentIndex, arrayLength) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * arrayLength);
    } while (newIndex === currentIndex);
    return newIndex;
}

// Resize canvas to match yellow box
function resizeCanvas() {
    canvas.width = mainHeader.offsetWidth;
    canvas.height = mainHeader.offsetHeight;
    drawPixels();
}

// Draw all pixels
function drawPixels() {
    const pixelWidth = Math.ceil(canvas.width / gridWidth);
    const pixelHeight = Math.ceil(canvas.height / gridHeight);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < totalPixels; i++) {
        const x = Math.floor((i % gridWidth) * (canvas.width / gridWidth));
        const y = Math.floor(Math.floor(i / gridWidth) * (canvas.height / gridHeight));
        
        const colorIndex = pixelStates[i] === 0 ? currentSetIndex : nextSetIndex;
        ctx.fillStyle = colorSets[colorIndex][0];
        body.style.backgroundColor = colorSets[currentSetIndex][0];
        ctx.fillRect(x, y, pixelWidth, pixelHeight);
    }
}

// Update pixels based on pull progress
function updatePixels(progress) {
    const pixelsToTurn = Math.floor(progress * totalPixels);
    
    for (let i = 0; i < totalPixels; i++) {
        pixelStates[i] = 0; // Reset to current color
    }
    
    for (let i = 0; i < pixelsToTurn; i++) {
        pixelStates[pixelOrder[i]] = 1; // Turn to next color in random order
    }
    
    // Update text color based on progress
    const currentTextColor = colorSets[currentSetIndex][1];
    const nextTextColor = colorSets[nextSetIndex][1];
    
    // Interpolate between colors or switch at 50%
    if (progress > 0.5) {
        content.style.color = nextTextColor;
    } else {
        content.style.color = currentTextColor;
    }
    
    drawPixels();
}

// Initialize
initPixels();
resizeCanvas();
content.style.color = colorSets[currentSetIndex][1];
window.addEventListener('resize', resizeCanvas);

window.addEventListener('scroll', () => {
    isAtTop = window.scrollY === 0;
});

window.addEventListener('touchstart', (e) => {
    if (isAtTop) {
        startY = e.touches[0].clientY;
        reachedThreshold = false;
        nextSetIndex = getRandomIndex(currentSetIndex, colorSets.length);
    }
});

window.addEventListener('touchmove', (e) => {
    if (isAtTop && window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const pullDistance = Math.max(0, currentY - startY);
        currentPull = Math.min(pullDistance, maxPadding - basePadding);
        
        const newPadding = basePadding + currentPull;
        mainHeader.style.paddingTop = `${newPadding}px`;
        mainHeader.style.paddingBottom = `${newPadding}px`;
        
        const progress = currentPull / threshold;
        updatePixels(Math.min(progress, 1));
        
        if (currentPull >= threshold) {
            reachedThreshold = true;
        }
        
        resizeCanvas();
    }
});

window.addEventListener('touchend', () => {
    mainHeader.style.paddingTop = `${basePadding}px`;
    mainHeader.style.paddingBottom = `${basePadding}px`;
    
    if (reachedThreshold) {
        // Change to next set
        currentSetIndex = nextSetIndex;
        for (let i = 0; i < totalPixels; i++) {
            pixelStates[i] = 0;
        }
        content.style.color = colorSets[currentSetIndex][1];
        body.style.backgroundColor = colorSets[currentSetIndex][0];

        // Change heading randomly
        const newHeadingIndex = Math.floor(Math.random() * headings.length);
        heading.textContent = headings[newHeadingIndex];
    } else {
        // Reset to current set
        for (let i = 0; i < totalPixels; i++) {
            pixelStates[i] = 0;
        }
        content.style.color = colorSets[currentSetIndex][1];
        body.style.backgroundColor = colorSets[currentSetIndex][0];

    }
    
    currentPull = 0;
    reachedThreshold = false;
    initPixels(); // Re-shuffle for next interaction
    resizeCanvas();
});

// Desktop mouse support
let isMouseDown = false;

window.addEventListener('mousedown', (e) => {
    if (isAtTop) {
        isMouseDown = true;
        startY = e.clientY;
        reachedThreshold = false;
        nextSetIndex = getRandomIndex(currentSetIndex, colorSets.length);
    }
});

window.addEventListener('mousemove', (e) => {
    if (isMouseDown && isAtTop && window.scrollY === 0) {
        const currentY = e.clientY;
        const pullDistance = Math.max(0, currentY - startY);
        currentPull = Math.min(pullDistance, maxPadding - basePadding);
        
        const newPadding = basePadding + currentPull;
        mainHeader.style.paddingTop = `${newPadding}px`;
        mainHeader.style.paddingBottom = `${newPadding}px`;
        
        const progress = currentPull / threshold;
        updatePixels(Math.min(progress, 1));
        
        if (currentPull >= threshold) {
            reachedThreshold = true;
        }
        
        resizeCanvas();
    }
});

window.addEventListener('mouseup', () => {
    if (isMouseDown) {
        isMouseDown = false;
        mainHeader.style.paddingTop = `${basePadding}px`;
        mainHeader.style.paddingBottom = `${basePadding}px`;
        
        if (reachedThreshold) {
            // Change to next set
            currentSetIndex = nextSetIndex;
            for (let i = 0; i < totalPixels; i++) {
                pixelStates[i] = 0;
            }
            content.style.color = colorSets[currentSetIndex][1];
            
            // Change heading randomly
            const newHeadingIndex = Math.floor(Math.random() * headings.length);
            heading.textContent = headings[newHeadingIndex];
        } else {
            // Reset to current set
            for (let i = 0; i < totalPixels; i++) {
                pixelStates[i] = 0;
            }
            content.style.color = colorSets[currentSetIndex][1];
            body.style.backgroundColor = colorSets[currentSetIndex][0];
        }
        
        currentPull = 0;
        reachedThreshold = false;
        initPixels(); // Re-shuffle for next interaction
        resizeCanvas();
    }
});

// Wheel event for desktop scrolling
let wheelTimeout;
window.addEventListener('wheel', (e) => {
    if (window.scrollY === 0 && e.deltaY < 0) {
        e.preventDefault();
        
        if (currentPull === 0) {
            nextSetIndex = getRandomIndex(currentSetIndex, colorSets.length);
        }
        
        const pullAmount = Math.abs(e.deltaY) * 0.5;
        currentPull = Math.min(currentPull + pullAmount, maxPadding - basePadding);
        
        const newPadding = basePadding + currentPull;
        mainHeader.style.paddingTop = `${newPadding}px`;
        mainHeader.style.paddingBottom = `${newPadding}px`;
        
        const progress = currentPull / threshold;
        updatePixels(Math.min(progress, 1));
        
        if (currentPull >= threshold) {
            reachedThreshold = true;
        }
        
        resizeCanvas();
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            mainHeader.style.paddingTop = `${basePadding}px`;
            mainHeader.style.paddingBottom = `${basePadding}px`;
            
            if (reachedThreshold) {
                // Change to next set
                currentSetIndex = nextSetIndex;
                for (let i = 0; i < totalPixels; i++) {
                    pixelStates[i] = 0;
                }
                content.style.color = colorSets[currentSetIndex][1];
                body.style.backgroundColor = colorSets[currentSetIndex][0];
                
                // Change heading randomly
                const newHeadingIndex = Math.floor(Math.random() * headings.length);
                heading.textContent = headings[newHeadingIndex];
            } else {
                // Reset to current set
                for (let i = 0; i < totalPixels; i++) {
                    pixelStates[i] = 0;
                }
                content.style.color = colorSets[currentSetIndex][1];
                body.style.backgroundColor = colorSets[currentSetIndex][0];
            }
            
            currentPull = 0;
            reachedThreshold = false;
            initPixels(); // Re-shuffle for next interaction
            resizeCanvas();
        }, 150);
    }
}, { passive: false });