class ShapeGenerator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.initializeState();
        this.bindEvents();
        this.resizeCanvas();
        this.randomizeGradient();
        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-weight: 400;
                    font-size: 14px;
                    background: linear-gradient(135deg, #f0f2f5 0%, #e8ebef 100%);
                    min-height: 100vh;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                @media (min-width: 768px) {
                    .container {
                        flex-direction: row;
                        gap: 30px;
                    }
                }

                /* Canvas Area */
                .canvas-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
                    border-radius: 25px;
                    padding: 30px;
                    box-shadow: 
                        20px 20px 40px rgba(174, 179, 186, 0.4),
                        -20px -20px 40px rgba(255, 255, 255, 0.8),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.1),
                        inset -2px -2px 4px rgba(174, 179, 186, 0.1);
                }

                #shapeCanvas {
                    border-radius: 20px;
                    box-shadow: 
                        inset 8px 8px 16px rgba(174, 179, 186, 0.3),
                        inset -8px -8px 16px rgba(255, 255, 255, 0.7);
                    background: #f0f2f5;
                }

                .canvas-controls {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-top: 25px;
                    width: 100%;
                    max-width: 400px;
                }

                /* Neumorphic Button */
                .neu-button {
                    background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
                    border: none;
                    border-radius: 15px;
                    padding: 12px 20px;
                    font-family: inherit;
                    font-weight: 500;
                    font-size: 14px;
                    color: #5a6c7d;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 
                        8px 8px 16px rgba(174, 179, 186, 0.4),
                        -8px -8px 16px rgba(255, 255, 255, 0.8);
                }

                .neu-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 
                        10px 10px 20px rgba(174, 179, 186, 0.5),
                        -10px -10px 20px rgba(255, 255, 255, 0.9);
                }

                .neu-button:active {
                    transform: translateY(1px);
                    box-shadow: 
                        inset 4px 4px 8px rgba(174, 179, 186, 0.3),
                        inset -4px -4px 8px rgba(255, 255, 255, 0.7);
                }

                .neu-button.primary {
                    background: linear-gradient(145deg, #7c9cbf, #6b8ab3);
                    color: white;
                    flex: 1;
                }

                /* Toggle Switch */
                .toggle-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .toggle-label {
                    color: #5a6c7d;
                    font-weight: 500;
                    font-size: 14px;
                }

                .toggle {
                    position: relative;
                    width: 50px;
                    height: 25px;
                    background: linear-gradient(145deg, #e6e9ed, #f0f2f5);
                    border-radius: 25px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 
                        inset 4px 4px 8px rgba(174, 179, 186, 0.3),
                        inset -4px -4px 8px rgba(255, 255, 255, 0.7);
                }

                .toggle.active {
                    background: linear-gradient(145deg, #7c9cbf, #6b8ab3);
                }

                .toggle-thumb {
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 19px;
                    height: 19px;
                    background: linear-gradient(145deg, #ffffff, #f0f2f5);
                    border-radius: 50%;
                    transition: transform 0.3s ease;
                    box-shadow: 
                        2px 2px 4px rgba(174, 179, 186, 0.3),
                        -1px -1px 2px rgba(255, 255, 255, 0.8);
                }

                .toggle.active .toggle-thumb {
                    transform: translateX(25px);
                }

                .toggle input {
                    display: none;
                }

                /* Controls Sidebar */
                .controls-sidebar {
                    width: 100%;
                    max-width: 350px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                @media (min-width: 768px) {
                    .controls-sidebar {
                        width: 350px;
                    }
                }

                .control-group {
                    background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
                    border-radius: 20px;
                    padding: 25px;
                    box-shadow: 
                        15px 15px 30px rgba(174, 179, 186, 0.4),
                        -15px -15px 30px rgba(255, 255, 255, 0.8);
                }

                .group-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .control-item {
                    margin-bottom: 20px;
                }

                .control-item:last-child {
                    margin-bottom: 0;
                }

                .control-label {
                    display: block;
                    color: #5a6c7d;
                    margin-bottom: 10px;
                    font-weight: 500;
                }

                .editable-value {
                    color: #7c9cbf;
                    font-weight: 600;
                    cursor: text;
                    padding: 2px 6px;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .editable-value:focus {
                    outline: none;
                    background: rgba(124, 156, 191, 0.1);
                    box-shadow: 0 0 0 2px rgba(124, 156, 191, 0.3);
                }

                /* Neumorphic Slider */
                .neu-slider {
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(145deg, #e6e9ed, #f0f2f5);
                    border-radius: 25px;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    box-shadow: 
                        inset 3px 3px 6px rgba(174, 179, 186, 0.3),
                        inset -3px -3px 6px rgba(255, 255, 255, 0.7);
                }

                .neu-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(145deg, #ffffff, #f0f2f5);
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 
                        4px 4px 8px rgba(174, 179, 186, 0.3),
                        -4px -4px 8px rgba(255, 255, 255, 0.8);
                }

                .neu-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 
                        6px 6px 12px rgba(174, 179, 186, 0.4),
                        -6px -6px 12px rgba(255, 255, 255, 0.9);
                }

                .neu-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(145deg, #ffffff, #f0f2f5);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 
                        4px 4px 8px rgba(174, 179, 186, 0.3),
                        -4px -4px 8px rgba(255, 255, 255, 0.8);
                }

                .divider {
                    height: 1px;
                    background: linear-gradient(90deg, 
                        rgba(174, 179, 186, 0.2) 0%, 
                        rgba(174, 179, 186, 0.4) 50%, 
                        rgba(174, 179, 186, 0.2) 100%);
                    margin: 20px 0;
                }

                /* Radio Buttons */
                .radio-group {
                    display: flex;
                    gap: 20px;
                }

                .radio-item {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                .neu-radio {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, #e6e9ed, #f0f2f5);
                    margin-right: 8px;
                    cursor: pointer;
                    position: relative;
                    box-shadow: 
                        inset 2px 2px 4px rgba(174, 179, 186, 0.3),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.7);
                }

                .neu-radio:checked {
                    background: linear-gradient(145deg, #7c9cbf, #6b8ab3);
                }

                .neu-radio:checked::after {
                    content: '';
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: white;
                    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                }

                /* Color Swatches */
                .color-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                }

                .color-swatch {
                    width: 35px;
                    height: 35px;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 
                        4px 4px 8px rgba(174, 179, 186, 0.3),
                        -4px -4px 8px rgba(255, 255, 255, 0.6);
                }

                .color-swatch:hover {
                    transform: translateY(-2px);
                    box-shadow: 
                        6px 6px 12px rgba(174, 179, 186, 0.4),
                        -6px -6px 12px rgba(255, 255, 255, 0.8);
                }

                .color-swatch.selected {
                    box-shadow: 
                        inset 2px 2px 4px rgba(0, 0, 0, 0.2),
                        4px 4px 8px rgba(174, 179, 186, 0.3),
                        0 0 0 3px rgba(124, 156, 191, 0.4);
                }

                /* Gradient Controls */
                .gradient-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .gradient-back-btn {
                    padding: 8px;
                    background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    box-shadow: 
                        6px 6px 12px rgba(174, 179, 186, 0.3),
                        -6px -6px 12px rgba(255, 255, 255, 0.8);
                }

                .gradient-back-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .gradient-back-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: #5a6c7d;
                }

                /* Select Dropdown */
                .neu-select {
                    width: 100%;
                    padding: 10px 15px;
                    background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
                    border: none;
                    border-radius: 12px;
                    color: #5a6c7d;
                    font-family: inherit;
                    cursor: pointer;
                    box-shadow: 
                        inset 3px 3px 6px rgba(174, 179, 186, 0.2),
                        inset -3px -3px 6px rgba(255, 255, 255, 0.7);
                }

                .neu-select:focus {
                    outline: none;
                    box-shadow: 
                        inset 3px 3px 6px rgba(174, 179, 186, 0.3),
                        inset -3px -3px 6px rgba(255, 255, 255, 0.8),
                        0 0 0 2px rgba(124, 156, 191, 0.3);
                }

                /* Export buttons */
                .export-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .button-row {
                    display: flex;
                    gap: 10px;
                }

                /* Toast */
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(145deg, #a8d08d, #95c27a);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    box-shadow: 
                        8px 8px 16px rgba(174, 179, 186, 0.4),
                        -8px -8px 16px rgba(255, 255, 255, 0.6);
                    z-index: 1000;
                }

                .toast.show {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Hidden class */
                .hidden {
                    display: none !important;
                }
            </style>

            <div class="container">
                <!-- Canvas Area -->
                <div class="canvas-area">
                    <canvas id="shapeCanvas"></canvas>
                    <div class="canvas-controls">
                        <button id="generateBtn" class="neu-button primary">Generate New Shape</button>
                        <div class="toggle-container">
                            <span class="toggle-label">Undulate</span>
                            <div class="toggle" id="undulationToggle">
                                <input type="checkbox" checked>
                                <div class="toggle-thumb"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Controls Sidebar -->
                <div class="controls-sidebar">
                    <!-- Controls Group -->
                    <div class="control-group">
                        <div class="group-title">Controls</div>
                        <div class="control-item">
                            <label class="control-label">
                                Points: <span id="pointsValue" contenteditable="true" class="editable-value">8</span>
                            </label>
                            <input id="points" type="range" min="3" max="30" value="8" class="neu-slider">
                        </div>
                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">
                                Roughness: <span id="roughnessValue" contenteditable="true" class="editable-value">0.4</span>
                            </label>
                            <input id="roughness" type="range" min="0" max="1" step="0.05" value="0.4" class="neu-slider">
                        </div>
                    </div>

                    <!-- Colors Group -->
                    <div class="control-group">
                        <div class="group-title">Colors</div>
                        <div class="control-item">
                            <label class="control-label">Fill Mode</label>
                            <div class="radio-group">
                                <label class="radio-item">
                                    <input type="radio" id="fillGradient" name="fillMode" value="gradient" class="neu-radio" checked>
                                    <span>Gradient</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" id="fillSolid" name="fillMode" value="solid" class="neu-radio">
                                    <span>Solid</span>
                                </label>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div id="solidColorControls" class="hidden">
                            <label class="control-label">Shape Color</label>
                            <div id="shapeColorSwatches" class="color-grid"></div>
                        </div>
                        <div id="gradientControls">
                            <div class="control-item">
                                <label class="control-label">Shape Gradient</label>
                                <div class="gradient-controls">
                                    <button id="gradientBackBtn" class="gradient-back-btn">
                                        <svg viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <button id="randomizeGradientBtn" class="neu-button" style="flex: 1;">Randomize</button>
                                </div>
                            </div>
                            <div class="control-item">
                                <label class="control-label">
                                    Saturation: <span id="saturationValue" class="editable-value">1</span>
                                </label>
                                <input id="saturation" type="range" min="1" max="4" step="0.05" value="1" class="neu-slider">
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">Background</label>
                            <div id="bgColorSwatches" class="color-grid"></div>
                        </div>
                    </div>

                    <!-- Effects Group -->
                    <div class="control-group">
                        <div class="group-title">Effects</div>
                        <div class="control-item">
                            <label class="control-label">
                                Lighting: <span id="lightingValue" class="editable-value">0.5</span>
                            </label>
                            <input id="lighting" type="range" min="0" max="1" step="0.1" value="0.5" class="neu-slider">
                        </div>
                        <div class="control-item">
                            <label class="control-label">Lighting Blend</label>
                            <select id="lightingBlendMode" class="neu-select">
                                <option value="source-over">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="color-dodge">Color Dodge</option>
                                <option value="color-burn">Color Burn</option>
                                <option value="hard-light" selected>Hard Light</option>
                                <option value="soft-light">Soft Light</option>
                                <option value="difference">Difference</option>
                                <option value="exclusion">Exclusion</option>
                                <option value="hue">Hue</option>
                                <option value="saturation">Saturation</option>
                                <option value="color">Color</option>
                                <option value="luminosity">Luminosity</option>
                            </select>
                        </div>
                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">
                                Grain: <span id="grainValue" class="editable-value">0</span>
                            </label>
                            <input id="grain" type="range" min="0" max="0.1" step="0.01" value="0" class="neu-slider">
                        </div>
                        <div class="control-item">
                            <label class="control-label">Grain Blend</label>
                            <select id="grainBlendMode" class="neu-select">
                                <option value="source-over">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="color-dodge">Color Dodge</option>
                                <option value="color-burn">Color Burn</option>
                                <option value="hard-light" selected>Hard Light</option>
                                <option value="soft-light">Soft Light</option>
                                <option value="difference">Difference</option>
                                <option value="exclusion">Exclusion</option>
                                <option value="hue">Hue</option>
                                <option value="saturation">Saturation</option>
                                <option value="color">Color</option>
                                <option value="luminosity">Luminosity</option>
                            </select>
                        </div>
                    </div>

                    <!-- Export Group -->
                    <div class="control-group">
                        <div class="group-title">Export</div>
                        <div class="export-buttons">
                            <div class="button-row">
                                <button id="saveSvgBtn" class="neu-button" style="flex: 1;">Save SVG</button>
                                <button id="copyHtmlBtn" class="neu-button" style="flex: 1;">Copy HTML</button>
                            </div>
                            <button id="savePngBtn" class="neu-button">Save as PNG</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Toast Notification -->
            <div id="toast" class="toast">HTML copied to clipboard!</div>
        `;
    }

    initializeState() {
        // Get elements
        this.canvas = this.shadowRoot.getElementById('shapeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pointsSlider = this.shadowRoot.getElementById('points');
        this.roughnessSlider = this.shadowRoot.getElementById('roughness');
        this.lightingSlider = this.shadowRoot.getElementById('lighting');
        this.lightingBlendModeSelect = this.shadowRoot.getElementById('lightingBlendMode');
        this.grainSlider = this.shadowRoot.getElementById('grain');
        this.grainBlendModeSelect = this.shadowRoot.getElementById('grainBlendMode');
        this.shapeColorSwatchesContainer = this.shadowRoot.getElementById('shapeColorSwatches');
        this.bgColorSwatchesContainer = this.shadowRoot.getElementById('bgColorSwatches');
        this.generateBtn = this.shadowRoot.getElementById('generateBtn');
        this.saveSvgBtn = this.shadowRoot.getElementById('saveSvgBtn');
        this.copyHtmlBtn = this.shadowRoot.getElementById('copyHtmlBtn');
        this.savePngBtn = this.shadowRoot.getElementById('savePngBtn');
        this.toast = this.shadowRoot.getElementById('toast');
        this.fillModeRadios = this.shadowRoot.querySelectorAll('input[name="fillMode"]');
        this.solidColorControls = this.shadowRoot.getElementById('solidColorControls');
        this.gradientControls = this.shadowRoot.getElementById('gradientControls');
        this.randomizeGradientBtn = this.shadowRoot.getElementById('randomizeGradientBtn');
        this.gradientBackBtn = this.shadowRoot.getElementById('gradientBackBtn');
        this.saturationSlider = this.shadowRoot.getElementById('saturation');
        this.saturationValueSpan = this.shadowRoot.getElementById('saturationValue');
        this.undulationToggle = this.shadowRoot.getElementById('undulationToggle');
        this.pointsValueSpan = this.shadowRoot.getElementById('pointsValue');
        this.roughnessValueSpan = this.shadowRoot.getElementById('roughnessValue');
        this.lightingValueSpan = this.shadowRoot.getElementById('lightingValue');
        this.grainValueSpan = this.shadowRoot.getElementById('grainValue');

        // Offscreen canvas for grain texture
        this.grainTextures = [];
        this.NUM_GRAIN_TEXTURES = 20;

        // Neumorphic Color Palette
        this.neuColors = [
            '#7c9cbf', '#95a5cf', '#b8a9cf', '#cf9fb8', // Blues to purples
            '#cf9f9f', '#cfa99f', '#cfb89f', '#c9cf9f', // Warm tones
            '#a9cf9f', '#9fcfb8', '#9fc9cf', '#9fb8cf', // Greens to blues
            '#a5a5a5', '#b8b8b8', '#cfcfcf', '#e0e0e0'  // Grays
        ];
        
        // State Object
        this.shapeState = {
            numPoints: 8,
            roughness: 0.4,
            lightingOpacity: 0.5,
            lightingBlendMode: 'hard-light',
            grainOpacity: 0.0,
            grainBlendMode: 'hard-light',
            undulationEnabled: true,
            shapeColor: '#7c9cbf',
            bgColor: '#f0f2f5',
            randomSeed: 0,
            fillMode: 'gradient',
            gradient: {
                colors: [],
                angle: 0,
                saturation: 1,
            },
            gradientHistory: [],
            gradientHistoryIndex: -1,
            animationStartTime: 0,
            animationDuration: 800,
            currentVertices: [],
            targetVertices: [],
            lastRenderedVertices: [],
        };

        this.initializeControls();
    }

    initializeControls() {
        this.pointsSlider.value = this.shapeState.numPoints;
        this.roughnessSlider.value = this.shapeState.roughness;
        this.lightingSlider.value = this.shapeState.lightingOpacity;
        this.lightingBlendModeSelect.value = this.shapeState.lightingBlendMode;
        this.grainSlider.value = this.shapeState.grainOpacity;
        this.grainBlendModeSelect.value = this.shapeState.grainBlendMode;
        this.undulationToggle.querySelector('input').checked = this.shapeState.undulationEnabled;
        this.pointsValueSpan.textContent = this.shapeState.numPoints;
        this.roughnessValueSpan.textContent = this.shapeState.roughness;
        this.lightingValueSpan.textContent = this.shapeState.lightingOpacity;
        this.grainValueSpan.textContent = this.shapeState.grainOpacity;
        this.saturationSlider.value = this.shapeState.gradient.saturation;
        this.saturationValueSpan.textContent = this.shapeState.gradient.saturation;

        this.createColorSwatches(this.shapeColorSwatchesContainer, 'shapeColor');
        this.createColorSwatches(this.bgColorSwatchesContainer, 'bgColor');
        this.updateSelectedSwatch(this.shapeColorSwatchesContainer, this.shapeState.shapeColor);
        this.updateSelectedSwatch(this.bgColorSwatchesContainer, this.shapeState.bgColor);

        this.handleFillModeChange({ target: { value: this.shapeState.fillMode } });
    }

    bindEvents() {
        this.pointsSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.roughnessSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.saturationSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.lightingSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.lightingBlendModeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.grainSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.grainBlendModeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.undulationToggle.addEventListener('click', this.handleUndulationToggle.bind(this));
        this.generateBtn.addEventListener('click', this.handleGenerateClick.bind(this));
        this.saveSvgBtn.addEventListener('click', this.handleSaveSvg.bind(this));
        this.copyHtmlBtn.addEventListener('click', this.handleCopyHtml.bind(this));
        this.savePngBtn.addEventListener('click', this.handleSavePng.bind(this));
        this.fillModeRadios.forEach(radio => radio.addEventListener('change', this.handleFillModeChange.bind(this)));
        this.randomizeGradientBtn.addEventListener('click', this.randomizeGradient.bind(this));
        this.gradientBackBtn.addEventListener('click', this.handleGradientBack.bind(this));
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        [this.pointsValueSpan, this.roughnessValueSpan].forEach(span => {
            const property = span.id === 'pointsValue' ? 'numPoints' : 'roughness';
            span.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    span.blur();
                }
            });
            span.addEventListener('blur', () => {
                this.handleValueSpanEdit(span, property);
            });
        });
    }

    handleUndulationToggle() {
        const checkbox = this.undulationToggle.querySelector('input');
        checkbox.checked = !checkbox.checked;
        this.shapeState.undulationEnabled = checkbox.checked;
        this.undulationToggle.classList.toggle('active', checkbox.checked);
    }

    // Core Drawing & Animation Logic
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
    
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    generateVertices(numPoints, radius, roughness, centerX, centerY) {
        const vertices = [];
        const angleStep = (Math.PI * 2) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const radiusDeviation = roughness;
            const randomRadiusFactor = 1 - radiusDeviation + (this.seededRandom(i * 4.56 + this.shapeState.randomSeed) * radiusDeviation * 2);
            const currentRadius = radius * randomRadiusFactor;

            const angleDeviation = angleStep * roughness;
            const angleOffset = (this.seededRandom(i * 7.89 + this.shapeState.randomSeed) - 0.5) * angleDeviation;
            const angle = i * angleStep + angleOffset;
            
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;
            vertices.push({ x, y });
        }
        return vertices;
    }

    getBoundingBox(vertices) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        if (vertices.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        vertices.forEach(v => {
            minX = Math.min(minX, v.x); minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x); maxY = Math.max(maxY, v.y);
        });
        return { minX, minY, maxX, maxY };
    }
    
    createShapePath(targetCtx, vertices) {
        if (vertices.length < 2) return;
        targetCtx.beginPath();
        const startPoint = {
            x: (vertices[vertices.length - 1].x + vertices[0].x) / 2,
            y: (vertices[vertices.length - 1].y + vertices[0].y) / 2
        };
        targetCtx.moveTo(startPoint.x, startPoint.y);

        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            targetCtx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        }
        targetCtx.closePath();
    }

    drawShape(targetCtx, vertices, fillStyle, box, grainTexture) {
        this.createShapePath(targetCtx, vertices);
        targetCtx.fillStyle = fillStyle;
        targetCtx.fill();

        // Lighting Effect
        if (this.shapeState.lightingOpacity > 0) {
            const lightingGradient = targetCtx.createLinearGradient(box.minX, box.minY, box.minX, box.maxY);
            lightingGradient.addColorStop(0, 'white');
            lightingGradient.addColorStop(1, 'black');
            
            targetCtx.globalCompositeOperation = this.shapeState.lightingBlendMode;
            targetCtx.globalAlpha = this.shapeState.lightingOpacity;
            targetCtx.fillStyle = lightingGradient;
            targetCtx.fill();
            targetCtx.globalCompositeOperation = 'source-over';
            targetCtx.globalAlpha = 1.0;
        }

        // Grain Effect
        if (this.shapeState.grainOpacity > 0) {
            targetCtx.save();
            this.createShapePath(targetCtx, vertices);
            targetCtx.clip();
            targetCtx.globalCompositeOperation = this.shapeState.grainBlendMode;
            targetCtx.globalAlpha = this.shapeState.grainOpacity;
            targetCtx.drawImage(grainTexture, 0, 0, targetCtx.canvas.width, targetCtx.canvas.height);
            targetCtx.restore();
        }
    }

    animate(timestamp) {
        if (!this.isConnected) return; // Stop animation if element is disconnected
        
        requestAnimationFrame(this.animate.bind(this));
        if (!this.shapeState.animationStartTime) this.shapeState.animationStartTime = timestamp;

        const elapsedTime = timestamp - this.shapeState.animationStartTime;
        const progress = Math.min(elapsedTime / this.shapeState.animationDuration, 1);
        const easedProgress = this.easeOutElastic(progress);
        
        let frameVertices = this.shapeState.currentVertices.map((start, i) => {
            const end = this.shapeState.targetVertices[i] || this.shapeState.targetVertices[this.shapeState.targetVertices.length-1];
            return { x: this.lerp(start.x, end.x, easedProgress), y: this.lerp(start.y, end.y, easedProgress) };
        });
        if(this.shapeState.targetVertices.length > this.shapeState.currentVertices.length) {
            for(let i = this.shapeState.currentVertices.length; i < this.shapeState.targetVertices.length; i++) {
                const start = frameVertices[i-1] || {x: this.canvas.width/2, y: this.canvas.height/2};
                const end = this.shapeState.targetVertices[i];
                frameVertices.push({ x: this.lerp(start.x, end.x, easedProgress), y: this.lerp(start.y, end.y, easedProgress) });
            }
        }

        let finalVertices = frameVertices;
        if (this.shapeState.undulationEnabled) {
            const undulationAmount = 1.5;
            const undulationSpeed = 0.0015;
            finalVertices = frameVertices.map((v, i) => ({
                x: v.x + Math.sin(timestamp * undulationSpeed + i * 2) * undulationAmount,
                y: v.y + Math.cos(timestamp * undulationSpeed + i * 2) * undulationAmount
            }));
        }
        
        this.shapeState.lastRenderedVertices = finalVertices;

        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = this.canvas.width / dpr;
        const logicalHeight = this.canvas.height / dpr;

        this.ctx.fillStyle = this.shapeState.bgColor;
        this.ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        const padding = 20;
        const box = this.getBoundingBox(finalVertices);
        const boxWidth = box.maxX - box.minX;
        const boxHeight = box.maxY - box.minY;
        const boxCenterX = box.minX + boxWidth / 2;
        const boxCenterY = box.minY + boxHeight / 2;

        const scaleX = (logicalWidth - padding * 2) / boxWidth;
        const scaleY = (logicalHeight - padding * 2) / boxHeight;
        const scale = Math.min(scaleX, scaleY);
        
        let fillStyle;
        if (this.shapeState.fillMode === 'solid') {
            fillStyle = this.shapeState.shapeColor;
            this.ctx.filter = 'none';
        } else {
            const angleRad = this.shapeState.gradient.angle * (Math.PI / 180);
            const halfWidth = boxWidth / 2;
            const halfHeight = boxHeight / 2;
            const length = Math.sqrt(halfWidth*halfWidth + halfHeight*halfHeight);
            const x0 = boxCenterX - Math.cos(angleRad) * length;
            const y0 = boxCenterY - Math.sin(angleRad) * length;
            const x1 = boxCenterX + Math.cos(angleRad) * length;
            const y1 = boxCenterY + Math.sin(angleRad) * length;
            const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop(0, this.shapeState.gradient.colors[0]);
            gradient.addColorStop(1, this.shapeState.gradient.colors[1]);
            fillStyle = gradient;
            this.ctx.filter = `saturate(${this.shapeState.gradient.saturation})`;
        }

        // Select current grain texture for this frame (10fps)
        const grainIndex = Math.floor(timestamp / 100) % this.NUM_GRAIN_TEXTURES;
        const currentGrainTexture = this.grainTextures[grainIndex];

        this.ctx.save();
        this.ctx.translate(logicalWidth / 2, logicalHeight / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-boxCenterX, -boxCenterY);
        if (currentGrainTexture) {
            this.drawShape(this.ctx, finalVertices, fillStyle, box, currentGrainTexture);
        }
        this.ctx.restore();
        this.ctx.filter = 'none';
    }

    triggerShapeGeneration() {
        if (this.shapeState.targetVertices.length > 0) {
             this.shapeState.currentVertices = this.shapeState.targetVertices;
        }
       
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = this.canvas.width / dpr;
        const logicalHeight = this.canvas.height / dpr;
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.5;
        this.shapeState.targetVertices = this.generateVertices(this.shapeState.numPoints, maxRadius, this.shapeState.roughness, centerX, centerY);
        
        this.shapeState.animationStartTime = 0;
    }

    updateGradientButtonsState() {
        this.gradientBackBtn.disabled = this.shapeState.gradientHistoryIndex <= 0;
    }

    randomizeGradient() {
        const shuffled = [...this.neuColors].sort(() => 0.5 - Math.random());
        const newGradient = {
            colors: shuffled.slice(0, 2),
            angle: Math.random() * 360,
            saturation: this.shapeState.gradient.saturation
        };

        if (this.shapeState.gradientHistoryIndex < this.shapeState.gradientHistory.length - 1) {
            this.shapeState.gradientHistory = this.shapeState.gradientHistory.slice(0, this.shapeState.gradientHistoryIndex + 1);
        }
        
        this.shapeState.gradientHistory.push(newGradient);
        this.shapeState.gradientHistoryIndex = this.shapeState.gradientHistory.length - 1;
        this.shapeState.gradient = newGradient;

        this.updateGradientButtonsState();
    }
    
    handleGradientBack() {
        if (this.shapeState.gradientHistoryIndex > 0) {
            this.shapeState.gradientHistoryIndex--;
            this.shapeState.gradient = this.shapeState.gradientHistory[this.shapeState.gradientHistoryIndex];
            
            this.saturationSlider.value = this.shapeState.gradient.saturation;
            this.saturationValueSpan.textContent = this.shapeState.gradient.saturation;

            this.updateGradientButtonsState();
        }
    }

    // Export and Copy Logic
    generateFullSvgString() {
        const vertices = this.shapeState.lastRenderedVertices;
        if (vertices.length < 2) return '';

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        vertices.forEach(v => {
            minX = Math.min(minX, v.x); minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x); maxY = Math.max(maxY, v.y);
        });

        const padding = 5; 
        minX -= padding; minY -= padding; maxX += padding; maxY += padding;
        const width = maxX - minX; const height = maxY - minY;

        let pathData = '';
        const startPoint = {
            x: ((vertices[vertices.length - 1].x + vertices[0].x) / 2) - minX,
            y: ((vertices[vertices.length - 1].y + vertices[0].y) / 2) - minY
        };
        pathData += `M ${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)} `;

        for (let i = 0; i < vertices.length; i++) {
            const p1 = { x: vertices[i].x - minX, y: vertices[i].y - minY };
            const p2 = vertices[(i + 1) % vertices.length];
            const midPoint = { 
                x: ((vertices[i].x + p2.x) / 2) - minX, 
                y: ((vertices[i].y + p2.y) / 2) - minY 
            };
            pathData += `Q ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${midPoint.x.toFixed(2)} ${midPoint.y.toFixed(2)} `;
        }
        pathData += 'Z';

        let fillAttr;
        let defs = '';
        let filterAttr = '';
        let lightingLayer = '';
        let grainLayer = '';

        if (this.shapeState.fillMode === 'gradient') {
            const angleRad = this.shapeState.gradient.angle * (Math.PI / 180);
            const gradX1 = 50 - Math.cos(angleRad) * 50;
            const gradY1 = 50 - Math.sin(angleRad) * 50;
            const gradX2 = 50 + Math.cos(angleRad) * 50;
            const gradY2 = 50 + Math.sin(angleRad) * 50;
            defs += `
        <linearGradient id="shape-gradient" x1="${gradX1.toFixed(2)}%" y1="${gradY1.toFixed(2)}%" x2="${gradX2.toFixed(2)}%" y2="${gradY2.toFixed(2)}%">
            <stop offset="0%" stop-color="${this.shapeState.gradient.colors[0]}" />
            <stop offset="100%" stop-color="${this.shapeState.gradient.colors[1]}" />
        </linearGradient>
        <filter id="saturate">
            <feColorMatrix type="saturate" values="${this.shapeState.gradient.saturation}" />
        </filter>`;
            fillAttr = 'url(#shape-gradient)';
            filterAttr = 'filter="url(#saturate)"';
        } else {
            fillAttr = this.shapeState.shapeColor;
        }

        if (this.shapeState.lightingOpacity > 0) {
            defs += `
        <linearGradient id="lighting-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="white" />
            <stop offset="100%" stop-color="black" />
        </linearGradient>`;
            lightingLayer = `<path d="${pathData}" fill="url(#lighting-gradient)" style="mix-blend-mode: ${this.shapeState.lightingBlendMode}; opacity: ${this.shapeState.lightingOpacity};" />`;
        }

        if (this.shapeState.grainOpacity > 0) {
            defs += `
        <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
        </filter>
        <mask id="shape-mask"><path d="${pathData}" fill="white" /></mask>`;
            grainLayer = `<rect width="100%" height="100%" filter="url(#grain)" mask="url(#shape-mask)" style="mix-blend-mode: ${this.shapeState.grainBlendMode}; opacity: ${this.shapeState.grainOpacity};" />`;
        }

        return `<svg width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs}</defs>
    <g>
        <g ${filterAttr}>
            <path d="${pathData}" fill="${fillAttr}" />
        </g>
        ${lightingLayer}
        ${grainLayer}
    </g>
</svg>`;
    }
    
    handleSaveSvg() {
        const svgString = this.generateFullSvgString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'shape.svg';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    handleCopyHtml() {
        const htmlString = this.generateFullSvgString();
        navigator.clipboard.writeText(htmlString).then(() => {
            this.toast.classList.add('show');
            setTimeout(() => { this.toast.classList.remove('show'); }, 2000);
        });
    }
    
    handleSavePng() {
        const vertices = this.shapeState.lastRenderedVertices;
        if (vertices.length < 2) return;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const size = 1024;
        tempCanvas.width = size;
        tempCanvas.height = size;
        
        const padding = 50;
        const box = this.getBoundingBox(vertices);
        const boxWidth = box.maxX - box.minX;
        const boxHeight = box.maxY - box.minY;
        const boxCenterX = box.minX + boxWidth / 2;
        const boxCenterY = box.minY + boxHeight / 2;

        const scaleX = (size - padding * 2) / boxWidth;
        const scaleY = (size - padding * 2) / boxHeight;
        const scale = Math.min(scaleX, scaleY);

        let fillStyle;
        if (this.shapeState.fillMode === 'solid') {
            fillStyle = this.shapeState.shapeColor;
            tempCtx.filter = 'none';
        } else {
            const angleRad = this.shapeState.gradient.angle * (Math.PI / 180);
            const halfWidth = boxWidth / 2;
            const halfHeight = boxHeight / 2;
            const length = Math.sqrt(halfWidth*halfWidth + halfHeight*halfHeight);
            const x0 = boxCenterX - Math.cos(angleRad) * length;
            const y0 = boxCenterY - Math.sin(angleRad) * length;
            const x1 = boxCenterX + Math.cos(angleRad) * length;
            const y1 = boxCenterY + Math.sin(angleRad) * length;
            const gradient = tempCtx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop(0, this.shapeState.gradient.colors[0]);
            gradient.addColorStop(1, this.shapeState.gradient.colors[1]);
            fillStyle = gradient;
            tempCtx.filter = `saturate(${this.shapeState.gradient.saturation})`;
        }

        tempCtx.save();
        tempCtx.translate(size / 2, size / 2);
        tempCtx.scale(scale, scale);
        tempCtx.translate(-boxCenterX, -boxCenterY);
        this.drawShape(tempCtx, vertices, fillStyle, box, this.grainTextures[0]);
        tempCtx.restore();

        const dataUrl = tempCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'shape.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 480);
        this.canvas.style.width = `${size}px`; 
        this.canvas.style.height = `${size}px`;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr; 
        this.canvas.height = size * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Regenerate grain texture on resize with 3x resolution
        const grainResolutionFactor = 3;
        this.grainTextures.length = 0;
        for(let i = 0; i < this.NUM_GRAIN_TEXTURES; i++) {
            const grainCanvas = document.createElement('canvas');
            grainCanvas.width = this.canvas.width * grainResolutionFactor;
            grainCanvas.height = this.canvas.height * grainResolutionFactor;
            const grainCtx = grainCanvas.getContext('2d');
            const imageData = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
                const val = Math.random() * 255;
                const contrastVal = 128 + (val - 128) * 1.5;
                data[j] = contrastVal;
                data[j + 1] = contrastVal;
                data[j + 2] = contrastVal;
                data[j + 3] = 255;
            }
            grainCtx.putImageData(imageData, 0, 0);
            this.grainTextures.push(grainCanvas);
        }

        this.triggerShapeGeneration();
    }
    
    handleValueSpanEdit(span, property) {
        let value;
        let min, max;

        if (property === 'numPoints') {
            value = parseInt(span.textContent, 10);
            min = 1;
            max = 50;
        } else {
            value = parseFloat(span.textContent);
            min = 0.01;
            max = 1;
        }

        if (isNaN(value) || value < min || value > max) {
            span.textContent = this.shapeState[property];
            return;
        }

        this.shapeState[property] = value;
        
        if (property === 'numPoints') {
            this.pointsSlider.value = value;
        } else {
            this.roughnessSlider.value = value;
        }

        this.triggerShapeGeneration();
    }

    handleInputChange(e) {
        const { id, value, type, checked } = e.target;
        if (id === 'points' || id === 'roughness') {
            const property = (id === 'points') ? 'numPoints' : 'roughness';
            this.shapeState[property] = parseFloat(value);
            this.shadowRoot.getElementById(`${id}Value`).textContent = value;
            this.triggerShapeGeneration();
        } else if (id === 'saturation') {
            this.shapeState.gradient.saturation = parseFloat(value);
            this.saturationValueSpan.textContent = value;
        } else if (id === 'lighting') {
            this.shapeState.lightingOpacity = parseFloat(value);
            this.lightingValueSpan.textContent = value;
        } else if (id === 'grain') {
            this.shapeState.grainOpacity = parseFloat(value);
            this.grainValueSpan.textContent = value;
        } else if (id === 'grainBlendMode') {
            this.shapeState.grainBlendMode = value;
        } else if (id === 'lightingBlendMode') {
            this.shapeState.lightingBlendMode = value;
        }
    }

    handleGenerateClick() {
        this.shapeState.randomSeed = Math.random() * 1000;
        this.triggerShapeGeneration();
    }

    handleFillModeChange(e) {
        this.shapeState.fillMode = e.target.value;
        if (this.shapeState.fillMode === 'solid') {
            this.solidColorControls.classList.remove('hidden');
            this.gradientControls.classList.add('hidden');
        } else {
            this.solidColorControls.classList.add('hidden');
            this.gradientControls.classList.remove('hidden');
        }
    }

    createColorSwatches(container, property) {
        this.neuColors.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;

            swatch.addEventListener('click', () => {
                this.shapeState[property] = color;
                this.updateSelectedSwatch(container, color);
            });
            container.appendChild(swatch);
        });
    }

    updateSelectedSwatch(container, selectedColor) {
         container.querySelectorAll('button').forEach(swatch => {
            if (swatch.dataset.color === selectedColor) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });
    }
}

// Register the custom element
customElements.define('shape-generator', ShapeGenerator);
