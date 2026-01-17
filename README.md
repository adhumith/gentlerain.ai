#  gentlerain.ai – Frontend Clone & Liquid Motion Engine

This project is a high-performance, motion-centric landing page developed to replicate the fluid aesthetics of the Gentle Rain platform. It progressively evolves from a semantic layout into a complex interactive environment featuring a **custom-coded 2D water physics engine** and a **retro-analog CRT visual layer**.

---

##  Technical Architecture

### 1. Fluid Dynamic Physics (Water Effect)
Unlike standard CSS animations, the hero background utilizes a **Discrete Sine Wave Propagation** algorithm rendered on an HTML5 Canvas.
* **Buffer Swapping:** The engine maintains two `Int16Array` buffers. Every frame, it calculates the new state of a pixel based on the average of its neighbors in the previous frame, then subtracts its current state to create wave oscillation.
* **Circular Energy Injection:** To ensure ripples look natural rather than digital, energy is injected using a circular distance formula ($x^2 + y^2 < r^2$).
* **Damping & Momentum:** A high damping factor (`0.985`) is applied to ensure waves have realistic inertial decay, feeling like a "heavy" rolling liquid.



### 2. 3D Parallax Refraction
To create a "3D depth" look for the "gentlerain" text, the engine implements **Coordinate-Based Displacement Mapping**:
* **The Bottom-of-the-Pool Effect:** The text is rendered to an offscreen buffer. The main loop calculates the "slope" of the water surface.
* **Parallax Math:** The engine uses the surface slope to offset the lookup coordinates for the text pixels. By adjusting the `depth` multiplier, the text appears to sit on the floor of the pool, warping realistically as swells pass over it.
* **Color Integrity:** A custom rendering bypass is used to ensure the text remains pure white, preventing the orange background from bleeding into the letters.



### 3. CRT Visual Layer
The "Old TV" aesthetic is achieved through a multi-layered post-processing approach:
* **Fractal Noise:** A high-frequency SVG noise filter is applied as a CSS overlay to create analog grain.
* **Scanlines:** A linear-gradient pattern mimics the physical aperture grille of a CRT monitor.
* **Per-Pixel Jitter:** The JavaScript loop applies a random brightness "jitter" to every pixel in every frame, simulating the vibrating phosphors of a tube television.



### 4. Synchronized Smooth Scrolling (Lenis + GSAP)
Standard browser scrolling is discrete and "step-based." This project uses **Lenis** to normalize input into a continuous fluid stream.
* **RequestAnimationFrame (RAF):** A unified loop synchronizes Lenis, GSAP, and the Water Physics at the monitor's native refresh rate.
* **Viewport Pinning:** The horizontal "Product" section locks in place while the internal track translates along the X-axis based on the calculation:
    $$ScrollDistance = TrackWidth - ViewportWidth$$

---

##  Features & Tasks

### Task 1 – Base Structure
- **Semantic HTML5:** Clean layout for SEO and accessibility.
- **Responsive Design:** Fluid typography and flex-grid systems.
- **Fixed Navbar:** A glassmorphism header using `backdrop-filter: blur`.

### Task 2 – Animations & Interactions
- **3D Flip Cards:** CSS `preserve-3d` context with custom `cubic-bezier` timing for non-linear physical response.
- **Smooth Anchor Bridge:** Lenis intercepts toolbar navigation clicks to provide a seamless slide to sections rather than a sudden jump.
- **Section Reveals:** GSAP `ScrollTrigger` is used to stagger the entrance of feature cards and animate UI elements as they enter the viewport.

---

##  Dependency Stack
| Library | Purpose |
| :--- | :--- |
| **Lenis** | Smooth scroll physics and inertial management. |
| **GSAP** | High-speed mathematical interpolation engine. |
| **ScrollTrigger** | Coordinate mapping for scroll-bound timelines. |
| **Vanilla JS** | Core 2D Water Physics Engine & Refraction Logic. |

---

##  Use of Artificial Intelligence
Artificial Intelligence was utilized sparingly during the development lifecycle. The role of AI was restricted to the generation of initial CSS boilerplate and the validation of cross-browser compatibility. All core animation logic—specifically the 2D wave propagation, the per-pixel refraction math, and the Lenis-to-GSAP proxy integration—was authored manually to ensure precise creative interpolation.

---

##  Performance Optimization
To ensure a stable 60FPS:
* **Physics Downsampling:** The engine calculates physics on a grid scaled at `1.5x` lower than the visual resolution, using CSS `image-rendering: auto` to smooth the result.
* **Bitwise Operations:** The physics loop uses bit-shifting (`>> 1`) instead of division to maximize calculation speed.
* **GPU Acceleration:** Elements are forced onto the GPU using `transform: translateZ(0)` and `will-change`.

---

**Status:** Completed.  
**Author:** GentleRain Development Team  
**Year:** 2026
