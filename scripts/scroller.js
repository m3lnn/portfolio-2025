const header = document.getElementById('mainHeader');
const headingQuote = document.getElementById('headingQuote');
const scrollIndicator = document.querySelector('.scroll-indicator');

let lastScrollY = window.scrollY;
let isScrollingUp = false;
let scrollUpDistance = 0;
let currentState = 1;
let isAtApex = false;
let apexReached = false;

const SCROLL_THRESHOLD = 50; // Minimum scroll up distance to activate
const APEX_THRESHOLD = 10; // Pixels from top to consider "at apex"
const STATE_CHANGE_DELAY = 800; // ms to wait at apex before state change

let apexTimer = null;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = lastScrollY - currentScrollY;
    
    // Detect scroll direction
    if (scrollDelta > 0) {
        // Scrolling up
        if (!isScrollingUp) {
            isScrollingUp = true;
            scrollUpDistance = 0;
        }
        scrollUpDistance += scrollDelta;
    } else {
        // Scrolling down - reset
        isScrollingUp = false;
        scrollUpDistance = 0;
        apexReached = false;
        clearTimeout(apexTimer);
        scrollIndicator.classList.remove('active');
        header.classList.remove('expanding', 'at-apex');
    }
    
    // Check if we're near the top
    const nearTop = currentScrollY <= APEX_THRESHOLD;
    
    if (isScrollingUp && scrollUpDistance > SCROLL_THRESHOLD) {
        // Show progress indicator
        scrollIndicator.classList.add('active');
        const progress = Math.min(scrollUpDistance / 500, 1);
        scrollIndicator.style.transform = `scaleX(${progress})`;
        
        // Add expanding class
        header.classList.add('expanding');
        
        if (nearTop && !apexReached) {
            // Reached apex
            apexReached = true;
            isAtApex = true;
            header.classList.add('at-apex');
            
            // Wait at apex, then transition to state 2
            apexTimer = setTimeout(() => {
                if (currentState === 1) {
                    transitionToState2();
                }
            }, STATE_CHANGE_DELAY);
        }
    }
    
    // Reset apex if we scroll down from top
    if (!nearTop && isAtApex) {
        isAtApex = false;
        header.classList.remove('at-apex');
    }
    
    lastScrollY = currentScrollY;
});

function transitionToState2() {
    header.classList.add('transitioning');
    
    setTimeout(() => {
        header.classList.add('state-2');
        header.classList.remove('expanding', 'at-apex', 'transitioning');
        scrollIndicator.classList.remove('active');
        
        // Change text content
        headingQuote.textContent = 'Embracing the journey of creation';
        
        currentState = 2;
    }, 300);
}

// Optional: Reset to state 1 when scrolling down past threshold
let resetTimeout;
window.addEventListener('scroll', () => {
    if (currentState === 2 && window.scrollY > 200) {
        clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
            header.classList.remove('state-2');
            headingQuote.textContent = 'Finding my place between beauty and practicality';
            currentState = 1;
        }, 500);
    }
});