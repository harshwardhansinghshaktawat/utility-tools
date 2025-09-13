---
// src/pages/blob-generator.astro
// A modern, advanced blob generator landing page with enhanced UI/UX
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Advanced Blob Shape Generator - Create Organic SVG Shapes</title>
    <meta name="description" content="Generate beautiful, organic SVG blob shapes with our advanced tool. Customize colors, animations, and export in SVG or PNG format.">
    <style>
      :root{
        --bg: #F7F8FA;
        --panel: #ffffff;
        --text: #222939;
        --accent: #2337FF;
        --accent-light: #4A56FF;
        --accent-dark: #1A2BCC;
        --text-muted: rgba(34, 41, 57, 0.6);
        --border: rgba(34, 41, 57, 0.08);
        --gradient-bg: linear-gradient(135deg, var(--bg) 0%, #ECEEF5 100%);
        --shadow-sm: 0 2px 8px rgba(34, 41, 57, 0.04);
        --shadow-md: 0 8px 24px rgba(34, 41, 57, 0.08);
        --shadow-lg: 0 16px 40px rgba(34, 41, 57, 0.12);
      }

      * { box-sizing: border-box; }
      
      html, body { height: 100%; }
      
      body {
        margin: 0;
        font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        background: var(--gradient-bg);
        color: var(--text);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.6;
      }

      /* Hero Section */
      .hero {
        text-align: center;
        max-width: 1000px;
        margin: 0 auto;
        padding: 80px 24px 60px;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(35, 55, 255, 0.08);
        color: var(--accent);
        padding: 8px 16px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 24px;
        border: 1px solid rgba(35, 55, 255, 0.12);
      }

      .hero h1 {
        font-size: clamp(36px, 5vw, 56px);
        font-weight: 900;
        margin: 0 0 16px;
        background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
      }

      .hero p {
        font-size: clamp(18px, 2.5vw, 22px);
        color: var(--text-muted);
        margin: 0 0 40px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 24px;
        margin-top: 48px;
      }

      .feature {
        text-align: center;
        padding: 24px 16px;
      }

      .feature-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        color: white;
        font-size: 20px;
      }

      .feature h3 {
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--text);
      }

      .feature p {
        font-size: 14px;
        color: var(--text-muted);
        margin: 0;
      }

      /* Main Content */
      .container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .app-grid {
        display: grid;
        grid-template-columns: 420px 1fr;
        gap: 32px;
        margin-bottom: 80px;
      }

      /* Control Panel */
      .control-panel {
        background: var(--panel);
        border-radius: 20px;
        padding: 32px;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        height: fit-content;
        position: sticky;
        top: 24px;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }

      .panel-title {
        font-size: 24px;
        font-weight: 800;
        margin: 0 0 4px;
        color: var(--text);
      }

      .panel-subtitle {
        color: var(--text-muted);
        font-size: 14px;
        margin: 0;
      }

      .export-buttons {
        display: flex;
        gap: 8px;
      }

      .btn {
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 20px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn:hover {
        background: var(--accent-light);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-secondary {
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
      }

      .btn-secondary:hover {
        background: var(--panel);
        border-color: var(--accent);
      }

      .btn-small {
        padding: 8px 16px;
        font-size: 13px;
      }

      /* Control Groups */
      .control-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-icon {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
      }

      .control-group {
        margin-bottom: 20px;
      }

      .control-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }

      .control-label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--text);
        margin-bottom: 8px;
      }

      .control-value {
        color: var(--accent);
        font-weight: 700;
      }

      input[type="range"] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--bg);
        outline: none;
        appearance: none;
        cursor: pointer;
      }

      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s ease;
      }

      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-md);
      }

      input[type="number"] {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg);
        color: var(--text);
        font-size: 14px;
        font-weight: 500;
      }

      input[type="number"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(35, 55, 255, 0.1);
      }

      .color-input-wrapper {
        position: relative;
        width: 100%;
        height: 48px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .color-input-wrapper:hover {
        border-color: var(--accent);
        box-shadow: var(--shadow-sm);
      }

      input[type="color"] {
        width: 100%;
        height: 100%;
        border: none;
        background: none;
        cursor: pointer;
      }

      .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--bg);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .checkbox-wrapper:hover {
        background: var(--panel);
        box-shadow: var(--shadow-sm);
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--accent);
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      .action-buttons .btn {
        flex: 1;
      }

      /* Preview Area */
      .preview-area {
        background: var(--panel);
        border-radius: 20px;
        padding: 32px;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        min-height: 700px;
      }

      .preview-header {
        display: flex;
        justify-content: between;
        align-items: center;
        margin-bottom: 24px;
      }

      .preview-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }

      .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      }

      .preview-container::before {
        content: '';
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(35, 55, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(35, 55, 255, 0.02) 0%, transparent 50%);
        pointer-events: none;
      }

      .svg-container {
        position: relative;
        z-index: 1;
      }

      svg {
        max-width: 100%;
        max-height: 80vh;
        filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.08));
        transition: filter 0.3s ease;
      }

      svg:hover {
        filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.12));
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .app-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .control-panel {
          position: static;
        }

        .hero {
          padding: 60px 24px 40px;
        }
      }

      @media (max-width: 768px) {
        .control-row {
          grid-template-columns: 1fr;
        }

        .export-buttons {
          flex-direction: column;
          width: 100%;
        }

        .panel-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }

        .action-buttons {
          flex-direction: column;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Loading Animation */
      .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 3px solid var(--bg);
        border-top: 3px solid var(--accent);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .loading.show {
        opacity: 1;
      }

      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }

      /* Tooltip */
      .tooltip {
        position: relative;
        cursor: help;
      }

      .tooltip::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--text);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 1000;
      }

      .tooltip:hover::after {
        opacity: 1;
      }
    </style>
  </head>
  <body>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-badge">
        ✨ Advanced SVG Generator
      </div>
      <h1>Create Beautiful Organic Blobs</h1>
      <p>Generate stunning, customizable SVG blob shapes with our advanced tool. Perfect for modern web designs, illustrations, and creative projects.</p>
      
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon">🎨</div>
          <h3>Infinite Customization</h3>
          <p>Adjust every aspect from colors to curves for perfect blobs</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <h3>Real-time Preview</h3>
          <p>See changes instantly with smooth animations and transitions</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📱</div>
          <h3>Export Ready</h3>
          <p>Download as SVG or high-quality PNG for any use case</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🔄</div>
          <h3>Animation Support</h3>
          <p>Add smooth animations with customizable speed and effects</p>
        </div>
      </div>
    </section>

    <!-- Main Application -->
    <div class="container">
      <div class="app-grid">
        <!-- Control Panel -->
        <aside class="control-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Blob Studio</h2>
              <p class="panel-subtitle">Craft your perfect organic shape</p>
            </div>
            <div class="export-buttons">
              <button id="downloadSvg" class="btn btn-small">
                <span>📄</span> SVG
              </button>
              <button id="downloadPng" class="btn btn-small">
                <span>🖼️</span> PNG
              </button>
            </div>
          </div>

          <!-- Shape Controls -->
          <div class="control-section">
            <div class="section-title">
              <div class="section-icon">⚙️</div>
              Shape Parameters
            </div>
            
            <div class="control-group">
              <label class="control-label">Seed (Randomness Base)</label>
              <input id="seed" type="number" value="42" min="0" max="999999" />
            </div>

            <div class="control-group">
              <label class="control-label">Points: <span class="control-value" id="pointsVal">7</span></label>
              <input id="points" type="range" min="3" max="64" value="7" />
            </div>

            <div class="control-group">
              <label class="control-label">Base Radius: <span class="control-value" id="radiusVal">140</span></label>
              <input id="radius" type="range" min="20" max="400" value="140" />
            </div>

            <div class="control-group">
              <label class="control-label">Randomness: <span class="control-value" id="randomnessVal">0.35</span></label>
              <input id="randomness" type="range" min="0" max="1" step="0.01" value="0.35" />
            </div>

            <div class="control-group">
              <label class="control-label">Smoothness: <span class="control-value" id="smoothVal">0.6</span></label>
              <input id="smoothness" type="range" min="0" max="1" step="0.01" value="0.6" />
            </div>
          </div>

          <!-- Style Controls -->
          <div class="control-section">
            <div class="section-title">
              <div class="section-icon">🎨</div>
              Visual Style
            </div>

            <div class="control-row">
              <div class="control-group">
                <label class="control-label">Fill Color A</label>
                <div class="color-input-wrapper">
                  <input id="colorA" type="color" value="#222939" />
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">Fill Color B</label>
                <div class="color-input-wrapper">
                  <input id="colorB" type="color" value="#2337FF" />
                </div>
              </div>
            </div>

            <div class="control-row">
              <div class="control-group">
                <label class="control-label">Stroke Width: <span class="control-value" id="strokeVal">6</span></label>
                <input id="strokeWidth" type="range" min="0" max="40" value="6" />
              </div>
              <div class="control-group">
                <label class="control-label">Stroke Color</label>
                <div class="color-input-wrapper">
                  <input id="strokeColor" type="color" value="#222939" />
                </div>
              </div>
            </div>

            <div class="control-group">
              <label class="control-label">Size: <span class="control-value" id="sizeVal">520</span>px</label>
              <input id="size" type="range" min="80" max="1200" value="520" />
            </div>
          </div>

          <!-- Animation Controls -->
          <div class="control-section">
            <div class="section-title">
              <div class="section-icon">🔄</div>
              Animation
            </div>

            <div class="checkbox-wrapper">
              <input id="animate" type="checkbox" />
              <label for="animate" class="control-label" style="margin: 0;">Enable Animation</label>
            </div>

            <div class="control-group" style="margin-top: 16px;">
              <label class="control-label">Animation Speed: <span class="control-value" id="speedVal">1.00</span></label>
              <input id="speed" type="range" min="0" max="3" step="0.01" value="1" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button id="randomize" class="btn">🎲 Randomize</button>
            <button id="reset" class="btn btn-secondary">🔄 Reset</button>
          </div>

          <div style="margin-top: 24px; padding: 16px; background: var(--bg); border-radius: 12px;">
            <p style="margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.4;">
              <strong>💡 Pro Tip:</strong> Higher point counts with increased smoothness create more organic, fluid shapes. Experiment with animation for dynamic effects!
            </p>
          </div>
        </aside>

        <!-- Preview Area -->
        <main class="preview-area">
          <div class="preview-header">
            <h3 class="preview-title">Live Preview</h3>
          </div>
          
          <div class="preview-container">
            <div class="loading" id="loading"></div>
            <div class="svg-container">
              <svg id="blobSvg" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="blobGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stop-color="#222939"/>
                    <stop offset="100%" stop-color="#2337FF"/>
                  </linearGradient>
                </defs>
                <g transform="translate(300,300)">
                  <path id="blobPath" d="" fill="url(#blobGradient)" stroke="#222939" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" />
                </g>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>

    <script type="module">
      // Enhanced blob generation with improved algorithms
      function makeRng(seed) {
        let x = seed ? seed >>> 0 : Math.floor(Math.random() * 4294967295);
        return function() {
          x ^= x << 13; x >>>= 0;
          x ^= x >>> 17; x >>>= 0;
          x ^= x << 5; x >>>= 0;
          return (x >>> 0) / 4294967295;
        }
      }

      function catmullRom2bezier(points, tension = 0.5) {
        const size = points.length;
        if (size < 2) return '';
        
        let d = '';
        for (let i = 0; i < size; i++) {
          const p0 = points[(i - 1 + size) % size];
          const p1 = points[i];
          const p2 = points[(i + 1) % size];
          const p3 = points[(i + 2) % size];
          
          if (i === 0) {
            d += `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} `;
          }
          
          const b1x = p1.x + (p2.x - p0.x) / 6 * tension * 2;
          const b1y = p1.y + (p2.y - p0.y) / 6 * tension * 2;
          const b2x = p2.x - (p3.x - p1.x) / 6 * tension * 2;
          const b2y = p2.y - (p3.y - p1.y) / 6 * tension * 2;
          
          d += `C ${b1x.toFixed(3)} ${b1y.toFixed(3)} ${b2x.toFixed(3)} ${b2y.toFixed(3)} ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} `;
        }
        d += 'Z';
        return d;
      }

      function generatePoints({seed, points, radius, randomness, time}) {
        const rng = makeRng(Number(seed));
        const out = [];
        const jitter = randomness * radius;
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const baseNoise = (rng() - 0.5) * 2;
          const wobble = Math.sin(angle * 3 + time * 0.9 + seed * 0.01) * 0.5;
          const r = radius + (baseNoise * 0.7 + wobble) * jitter;
          
          out.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
          });
        }
        return out;
      }

      // Enhanced UI controls
      const $ = id => document.getElementById(id);
      const inputs = {
        seed: $('seed'),
        points: $('points'),
        radius: $('radius'),
        randomness: $('randomness'),
        smoothness: $('smoothness'),
        colorA: $('colorA'),
        colorB: $('colorB'),
        strokeWidth: $('strokeWidth'),
        strokeColor: $('strokeColor'),
        size: $('size'),
        animate: $('animate'),
        speed: $('speed')
      };

      const display = {
        pointsVal: $('pointsVal'),
        radiusVal: $('radiusVal'),
        randomnessVal: $('randomnessVal'),
        smoothVal: $('smoothVal'),
        strokeVal: $('strokeVal'),
        sizeVal: $('sizeVal'),
        speedVal: $('speedVal')
      };

      const svg = $('blobSvg');
      const path = $('blobPath');
      const gradient = svg.querySelector('#blobGradient');
      const loading = $('loading');

      function readState() {
        return {
          seed: Number(inputs.seed.value) || 0,
          points: Number(inputs.points.value),
          radius: Number(inputs.radius.value),
          randomness: Number(inputs.randomness.value),
          smoothness: Number(inputs.smoothness.value),
          colorA: inputs.colorA.value,
          colorB: inputs.colorB.value,
          strokeWidth: Number(inputs.strokeWidth.value),
          strokeColor: inputs.strokeColor.value,
          size: Number(inputs.size.value),
          animate: inputs.animate.checked,
          speed: Number(inputs.speed.value)
        };
      }

      function syncDisplays() {
        display.pointsVal.textContent = inputs.points.value;
        display.radiusVal.textContent = inputs.radius.value;
        display.randomnessVal.textContent = Number(inputs.randomness.value).toFixed(2);
        display.smoothVal.textContent = Number(inputs.smoothness.value).toFixed(2);
        display.strokeVal.textContent = inputs.strokeWidth.value;
        display.sizeVal.textContent = inputs.size.value;
        display.speedVal.textContent = Number(inputs.speed.value).toFixed(2);
      }

      function render(time) {
        const state = readState();
        
        // Update SVG attributes
        svg.setAttribute('viewBox', `0 0 ${state.size} ${state.size}`);
        svg.querySelector('g').setAttribute('transform', `translate(${state.size/2},${state.size/2})`);
        
        // Update gradient colors
        const stops = gradient.querySelectorAll('stop');
        stops[0].setAttribute('stop-color', state.colorA);
        stops[1].setAttribute('stop-color', state.colorB);
        
        // Update stroke
        path.setAttribute('stroke-width', state.strokeWidth);
        path.setAttribute('stroke', state.strokeColor);
        
        // Generate and render blob
        const scaledRadius = state.radius * (state.size / 600);
        const points = generatePoints({
          seed: state.seed,
          points: state.points,
          radius: scaledRadius,
          randomness: state.randomness,
          time: time * state.speed
        });
        
        path.setAttribute('d', catmullRom2bezier(points, state.smoothness));
      }

      // Animation system
      let animationFrame = null;
      let startTime = null;

      function animationLoop(timestamp) {
        if (!startTime) startTime = timestamp;
        render((timestamp - startTime) / 1000);
        animationFrame = requestAnimationFrame(animationLoop);
      }

      function startAnimation() {
        stopAnimation();
        animationFrame = requestAnimationFrame(animationLoop);
      }

      function stopAnimation() {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
          startTime = null;
        }
      }

      function initialize() {
        syncDisplays();
        render(0);
        
        if (inputs.animate.checked) {
          startAnimation();
        }
      }

      // Event listeners with improved UX
      Object.keys(inputs).forEach(key => {
        if (key !== 'animate') {
          inputs[key].addEventListener('input', () => {
            syncDisplays();
            if (!inputs.animate.checked) {
              render(0);
            }
          });
        }
      });

      inputs.animate.addEventListener('change', () => {
        if (inputs.animate.checked) {
          startAnimation();
        } else {
          stopAnimation();
          render(0);
        }
      });

      // Enhanced randomize function
      $('randomize').addEventListener('click', () => {
        loading.classList.add('show');
        
        setTimeout(() => {
          inputs.seed.value = Math.floor(Math.random() * 100000);
          inputs.points.value = Math.floor(Math.random() * 28) + 3;
          inputs.randomness.value = (Math.random() * 0.9).toFixed(2);
          inputs.radius.value = Math.floor(Math.random() * 320) + 40;
          inputs.smoothness.value = (Math.random() * 1).toFixed(2);
          
          // Occasionally randomize colors too
          if (Math.random() > 0.7) {
            const hue1 = Math.floor(Math.random() * 360);
            const hue2 = (hue1 + 60 + Math.random() * 240) % 360;
            inputs.colorA.value = `hsl(${hue1}, 70%, 35%)`;
            inputs.colorB.value = `hsl(${hue2}, 70%, 55%)`;
          }
          
          syncDisplays();
          render(0);
          loading.classList.remove('show');
        }, 300);
      });

      // Reset function
      $('reset').addEventListener('click', () => {
        inputs.seed.value = 42;
        inputs.points.value = 7;
        inputs.radius.value = 140;
        inputs.randomness.value = 0.35;
        inputs.smoothness.value = 0.6;
        inputs.colorA.value = '#222939';
        inputs.colorB.value = '#2337FF';
        inputs.strokeWidth.value = 6;
        inputs.strokeColor.value = '#222939';
        inputs.size.value = 520;
        inputs.animate.checked = false;
        inputs.speed.value = 1;
        
        syncDisplays();
        stopAnimation();
        render(0);
      });

      // Enhanced download functions
      function downloadFile(filename, blob) {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.remove();
        }, 1500);
      }

      $('downloadSvg').addEventListener('click', () => {
        const svgString = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        downloadFile('blob.svg', blob);
      });

      $('downloadPng').addEventListener('click', () => {
        const state = readState();
        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        const svgString = new XMLSerializer().serializeToString(clone);
        const img = new Image();
        const svg64 = btoa(unescape(encodeURIComponent(svgString)));
        img.src = 'data:image/svg+xml;base64,' + svg64;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // High DPI
          canvas.width = state.size * scale;
          canvas.height = state.size * scale;
          
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, state.size, state.size);
          ctx.drawImage(img, 0, 0, state.size, state.size);
          
          canvas.toBlob(blob => {
            if (blob) downloadFile('blob.png', blob);
          }, 'image/png');
        };
      });

      // Initialize on load
      window.addEventListener('load', initialize);
    </script>
  </body>
</html>
