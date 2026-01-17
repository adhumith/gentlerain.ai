// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Smooth Anchor Navigation
document.querySelectorAll('.nav-links a, .footer-nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        lenis.scrollTo(targetId);
    });
});

// 2. Liquid Engine Setup
const canvas = document.getElementById('water-canvas');
const ctx = canvas.getContext('2d');
const h1 = document.getElementById('gl-text');

let width, height, size, buffer1, buffer2, texture, temp;
let textPixels = []; 
const damping = 0.98; // Keeps big waves rolling longer
function initLiquid() {
    // RESOLUTION CONTROL:
    // 1.8 - 2.0 is the sweet spot for a smooth, lag-free experience on most screens.
    const quality = 1.8; 

    // Width and Height are calculated for the physics grid.
    width = canvas.width = Math.floor(window.innerWidth / quality); 
    height = canvas.height = Math.floor(window.innerHeight / quality);
    size = width * height;
    
    buffer1 = new Int16Array(size);
    buffer2 = new Int16Array(size);
    texture = ctx.getImageData(0, 0, width, height);

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const oCtx = offscreen.getContext('2d');
    
    // TEXT STYLE & WEIGHT:
    oCtx.fillStyle = "white";
    
    // To make the text wider/bigger, we use a smaller divisor (was 8, now 6).
    const fontSize = Math.floor(width / 6); 
    
    // Weight set to 300 (Light) for premium look.
    oCtx.font = `800 ${fontSize}px 'Inter', sans-serif`; 
    oCtx.textAlign = "center";
    oCtx.textBaseline = "middle";

    // Anti-Aliasing Fix: Softens edges to make ripples look organic.
    oCtx.shadowColor = "white";
    oCtx.shadowBlur = 4; 

    oCtx.fillText("gentlerain", width / 2, height / 3.5);
    textPixels = oCtx.getImageData(0, 0, width, height).data;
    
    if (h1) h1.style.opacity = "0";
}

// Mouse interaction (Energy Wake)
window.addEventListener('mousemove', (e) => {
    if (lenis.scroll < window.innerHeight) {
        const x = Math.floor(e.clientX / (window.innerWidth / width));
        const y = Math.floor(e.clientY / (window.innerHeight / height));
        
        if (x > 0 && x < width && y > 0 && y < height) {
            // Mouse creates a smaller splash but high intensity
            const r = 2;
            for(let i = -r; i <= r; i++) {
                for(let j = -r; j <= r; j++) {
                    let idx = (y + j) * width + (x + i);
                    if(idx > 0 && idx < size) buffer1[idx] = 512;
                }
            }
        }
    }
});

function drawRipples() {
    let data = texture.data;

    // 1. INCREASED RIPPLE SIZE (Massive Swells)
    if (Math.random() < 0.04) { 
        const rx = Math.floor(Math.random() * (width - 60)) + 30;
        const ry = Math.floor(Math.random() * (height - 60)) + 30;
        
        // Huge Radius: 15-25 for rolling swells.
        const radius = Math.floor(Math.random() * 10) + 15; 
        const strength = 300; 

        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                // Circular distance check makes large ripples smooth.
                if (x*x + y*y < radius*radius) {
                    let idx = (rx + x) + (ry + y) * width;
                    if(idx > 0 && idx < size) buffer1[idx] += strength; 
                }
            }
        }
    }

    // 2. Optimized Propagation Loop
    for (let i = width; i < size - width; i++) {
        buffer2[i] = ((buffer1[i - 1] + buffer1[i + 1] + 
                       buffer1[i - width] + buffer1[i + width]) >> 1) - buffer2[i];
        
        // High damping (0.985) keeps the large waves rolling longer.
        buffer2[i] = (buffer2[i] * 0.985) | 0;

        let val = buffer2[i];
        let pixel = i * 4;

        // Refraction math scaled for bigger grid.
        let offsetX = (buffer1[i - 1] - buffer1[i + 1]) >> 3;
        let offsetY = (buffer1[i - width] - buffer1[i + width]) >> 3;

        let x = Math.min(width - 1, Math.max(0, (i % width) + offsetX));
        let y = Math.min(height - 1, Math.max(0, Math.floor(i / width) + offsetY));
        let textIdx = (x + y * width) * 4;

        if (textPixels[textIdx + 3] > 128) {
            // Force pure white for text.
            data[pixel] = data[pixel+1] = data[pixel+2] = 255; 
            data[pixel + 3] = 255;      
        } else {
            // Orange Background.
            data[pixel] = 255; 
            data[pixel + 1] = 110 + (val >> 3); 
            data[pixel + 2] = 20;
            data[pixel + 3] = 200 + Math.min(55, val); 
        }
    }

    temp = buffer1; buffer1 = buffer2; buffer2 = temp;
    ctx.putImageData(texture, 0, 0);
    requestAnimationFrame(drawRipples);
}

// 3. GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Horizontal Scroll Track
let mm = gsap.matchMedia();
mm.add("(min-width: 769px)", () => {
    const track = document.querySelector(".h-track");
    if(track) {
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: "#product",
                start: "top top",
                end: () => "+=" + track.scrollWidth,
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true
            }
        });
    }
});

// Section Reveals
gsap.from(".flip-card", {
    y: 80,
    opacity: 0,
    duration: 1.2,
    stagger: 0.3,
    ease: "power3.out",
    scrollTrigger: {
        trigger: ".features",
        start: "top 75%",
    }
});

gsap.to(".orange-line", {
    width: "100px",
    duration: 1.5,
    scrollTrigger: {
        trigger: ".business",
        start: "top 80%",
    }
});

// Text Rotator
const wordTl = gsap.timeline({ repeat: -1 });
const words = document.querySelectorAll(".word");
if(words.length > 0) {
    wordTl.to(".word", { 
        yPercent: -100 * (words.length - 1), 
        duration: 8, 
        ease: "none" 
    });
}

// Initialize
initLiquid();
drawRipples();
window.addEventListener('resize', initLiquid);
window.addEventListener("load", () => { ScrollTrigger.refresh(); });
