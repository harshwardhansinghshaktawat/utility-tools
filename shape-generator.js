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
                    max-width: 1400px;
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
                    max-width: 500px;
                    flex-wrap: wrap;
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
                    min-width: 180px;
                }

                .neu-button.small {
                    padding: 8px 16px;
                    font-size: 12px;
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
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding-right: 10px;
                }

                @media (min-width: 768px) {
                    .controls-sidebar {
                        width: 400px;
                    }
                }

                /* Custom Scrollbar */
                .controls-sidebar::-webkit-scrollbar {
                    width: 8px;
                }

                .controls-sidebar::-webkit-scrollbar-track {
                    background: linear-gradient(145deg, #e6e9ed, #f0f2f5);
                    border-radius: 10px;
                }

                .controls-sidebar::-webkit-scrollbar-thumb {
                    background: linear-gradient(145deg, #d0d4d9, #c5c9ce);
                    border-radius: 10px;
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
                    flex-wrap: wrap;
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

                /* Color Picker */
                .color-picker-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .color-picker {
                    width: 50px;
                    height: 35px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    background: none;
                    box-shadow: 
                        inset 2px 2px 4px rgba(174, 179, 186, 0.3),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.7);
                }

                .color-picker::-webkit-color-swatch {
                    border: none;
                    border-radius: 8px;
                }

                .color-picker::-moz-color-swatch {
                    border: none;
                    border-radius: 8px;
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

                .export-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .export-format-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 15px;
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

                /* Gradient Preview */
                .gradient-preview {
                    height: 40px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    box-shadow: 
                        inset 2px 2px 4px rgba(174, 179, 186, 0.3),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.7);
                }

                /* Animation Controls */
                .animation-controls {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                /* Multi-column layout for larger controls */
                .two-column {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    align-items: end;
                }

                /* Hidden class */
                .hidden {
                    display: none !important;
                }

                /* Progress indicator */
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(145deg, #e6e9ed, #f0f2f5);
                    border-radius: 2px;
                    overflow: hidden;
                    box-shadow: 
                        inset 2px 2px 4px rgba(174, 179, 186, 0.3),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.7);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #7c9cbf, #6b8ab3);
                    width: 0%;
                    transition: width 0.3s ease;
                }
            </style>

            <div class="container">
                <!-- Canvas Area -->
                <div class="canvas-area">
                    <canvas id="shapeCanvas"></canvas>
                    <div class="canvas-controls">
                        <button id="generateBtn" class="neu-button primary">Generate New Shape</button>
                        <div class="animation-controls">
                            <div class="toggle-container">
                                <span class="toggle-label">Undulate</span>
                                <div class="toggle" id="undulationToggle">
                                    <input type="checkbox" checked>
                                    <div class="toggle-thumb"></div>
                                </div>
                            </div>
                            <div class="toggle-container">
                                <span class="toggle-label">Transparent BG</span>
                                <div class="toggle" id="transparentToggle">
                                    <input type="checkbox">
                                    <div class="toggle-thumb"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Controls Sidebar -->
                <div class="controls-sidebar">
                    <!-- Controls Group -->
                    <div class="control-group">
                        <div class="group-title">Shape Controls</div>
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
                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">
                                Animation Speed: <span id="animSpeedValue" class="editable-value">1</span>
                            </label>
                            <input id="animSpeed" type="range" min="0.1" max="3" step="0.1" value="1" class="neu-slider">
                        </div>
                    </div>

                    <!-- Colors Group -->
                    <div class="control-group">
                        <div class="group-title">Colors & Fill</div>
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
                                <label class="radio-item">
                                    <input type="radio" id="fillPattern" name="fillMode" value="pattern" class="neu-radio">
                                    <span>Pattern</span>
                                </label>
                            </div>
                        </div>
                        <div class="divider"></div>
                        
                        <div id="solidColorControls" class="hidden">
                            <label class="control-label">Shape Color</label>
                            <div class="color-picker-container">
                                <input type="color" id="shapeColorPicker" class="color-picker" value="#7c9cbf">
                                <button id="randomSolidBtn" class="neu-button small">Random</button>
                            </div>
                            <div id="shapeColorSwatches" class="color-grid"></div>
                        </div>

                        <div id="gradientControls">
                            <div class="control-item">
                                <label class="control-label">Gradient Type</label>
                                <select id="gradientType" class="neu-select">
                                    <option value="linear">Linear</option>
                                    <option value="radial">Radial</option>
                                    <option value="conic">Conic</option>
                                </select>
                            </div>
                            
                            <div class="control-item">
                                <label class="control-label">Gradient Preview</label>
                                <div id="gradientPreview" class="gradient-preview"></div>
                            </div>

                            <div class="control-item">
                                <label class="control-label">Gradient Colors</label>
                                <div class="color-picker-container">
                                    <input type="color" id="gradientColor1" class="color-picker" value="#7c9cbf">
                                    <input type="color" id="gradientColor2" class="color-picker" value="#b8a9cf">
                                    <button id="swapColorsBtn" class="neu-button small">Swap</button>
                                    <button id="randomizeGradientBtn" class="neu-button small">Random</button>
                                </div>
                            </div>

                            <div class="control-item">
                                <div class="two-column">
                                    <div>
                                        <label class="control-label">
                                            Angle: <span id="gradientAngleValue" class="editable-value">0</span>°
                                        </label>
                                        <input id="gradientAngle" type="range" min="0" max="360" value="0" class="neu-slider">
                                    </div>
                                    <div>
                                        <label class="control-label">
                                            Saturation: <span id="saturationValue" class="editable-value">1</span>
                                        </label>
                                        <input id="saturation" type="range" min="0.1" max="4" step="0.05" value="1" class="neu-slider">
                                    </div>
                                </div>
                            </div>

                            <div class="control-item">
                                <div class="gradient-controls">
                                    <button id="gradientBackBtn" class="gradient-back-btn">
                                        <svg viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <button id="addGradientStopBtn" class="neu-button" style="flex: 1;">Add Color Stop</button>
                                </div>
                            </div>
                        </div>

                        <div id="patternControls" class="hidden">
                            <label class="control-label">Pattern Type</label>
                            <select id="patternType" class="neu-select">
                                <option value="dots">Dots</option>
                                <option value="lines">Lines</option>
                                <option value="grid">Grid</option>
                                <option value="noise">Noise</option>
                            </select>
                            <div class="control-item">
                                <label class="control-label">
                                    Pattern Scale: <span id="patternScaleValue" class="editable-value">10</span>
                                </label>
                                <input id="patternScale" type="range" min="1" max="50" value="10" class="neu-slider">
                            </div>
                        </div>

                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">Background</label>
                            <div class="color-picker-container">
                                <input type="color" id="bgColorPicker" class="color-picker" value="#f0f2f5">
                                <button id="randomBgBtn" class="neu-button small">Random</button>
                            </div>
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
                                <option value="hard-light" selected>Hard Light</option>
                                <option value="soft-light">Soft Light</option>
                            </select>
                        </div>
                        <div class="divider"></div>
                        <div class="control-item">
                            <label class="control-label">
                                Shadow Blur: <span id="shadowBlurValue" class="editable-value">0</span>
                            </label>
                            <input id="shadowBlur" type="range" min="0" max="50" value="0" class="neu-slider">
                        </div>
                        <div class="control-item">
                            <div class="two-column">
                                <div>
                                    <label class="control-label">
                                        Shadow X: <span id="shadowXValue" class="editable-value">0</span>
                                    </label>
                                    <input id="shadowX" type="range" min="-20" max="20" value="0" class="neu-slider">
                                </div>
                                <div>
                                    <label class="control-label">
                                        Shadow Y: <span id="shadowYValue" class="editable-value">0</span>
                                    </label>
                                    <input id="shadowY" type="range" min="-20" max="20" value="0" class="neu-slider">
                                </div>
                            </div>
                        </div>
                        <div class="control-item">
                            <label class="control-label">Shadow Color</label>
                            <input type="color" id="shadowColorPicker" class="color-picker" value="#000000">
                        </div>
                    </div>

                    <!-- Export Group -->
                    <div class="control-group">
                        <div class="group-title">Export Options</div>
                        
                        <div class="control-item">
                            <label class="control-label">Export Resolution</label>
                            <select id="exportResolution" class="neu-select">
                                <option value="512">512px × 512px</option>
                                <option value="1024" selected>1024px × 1024px</option>
                                <option value="2048">2048px × 2048px</option>
                                <option value="4096">4K (4096px × 4096px)</option>
                                <option value="custom">Custom Size</option>
                            </select>
                        </div>

                        <div id="customSizeControls" class="hidden">
                            <div class="two-column">
                                <div>
                                    <label class="control-label">Width</label>
                                    <input type="number" id="customWidth" value="1024" min="100" max="8192" class="neu-select">
                                </div>
                                <div>
                                    <label class="control-label">Height</label>
                                    <input type="number" id="customHeight" value="1024" min="100" max="8192" class="neu-select">
                                </div>
                            </div>
                        </div>

                        <div class="control-item">
                            <label class="control-label">Quick Export</label>
                            <div class="export-format-grid">
                                <button id="savePngBtn" class="neu-button small">PNG</button>
                                <button id="saveJpgBtn" class="neu-button small">JPG</button>
                                <button id="saveWebpBtn" class="neu-button small">WebP</button>
                                <button id="saveSvgBtn" class="neu-button small">SVG</button>
                                <button id="savePdfBtn" class="neu-button small">PDF</button>
                                <button id="copyHtmlBtn" class="neu-button small">Copy SVG</button>
                            </div>
                        </div>

                        <div class="divider"></div>
                        
                        <div class="control-item">
                            <button id="batchExportBtn" class="neu-button" style="width: 100%;">Batch Export All Formats</button>
                            <div id="exportProgress" class="progress-bar hidden" style="margin-top: 10px;">
                                <div id="exportProgressFill" class="progress-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Toast Notification -->
            <div id="toast" class="toast">Operation completed!</div>
        `;
    }

    initializeState() {
        // Get elements
        this.canvas = this.shadowRoot.getElementById('shapeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Control elements
        this.pointsSlider = this.shadowRoot.getElementById('points');
        this.roughnessSlider = this.shadowRoot.getElementById('roughness');
        this.animSpeedSlider = this.shadowRoot.getElementById('animSpeed');
        this.lightingSlider = this.shadowRoot.getElementById('lighting');
        this.lightingBlendModeSelect = this.shadowRoot.getElementById('lightingBlendMode');
        this.grainSlider = this.shadowRoot.getElementById('grain');
        this.grainBlendModeSelect = this.shadowRoot.getElementById('grainBlendMode');
        this.shadowBlurSlider = this.shadowRoot.getElementById('shadowBlur');
        this.shadowXSlider = this.shadowRoot.getElementById('shadowX');
        this.shadowYSlider = this.shadowRoot.getElementById('shadowY');
        this.shadowColorPicker = this.shadowRoot.getElementById('shadowColorPicker');
        
        // Color elements
        this.shapeColorPicker = this.shadowRoot.getElementById('shapeColorPicker');
        this.bgColorPicker = this.shadowRoot.getElementById('bgColorPicker');
        this.gradientColor1 = this.shadowRoot.getElementById('gradientColor1');
        this.gradientColor2 = this.shadowRoot.getElementById('gradientColor2');
        this.gradientAngleSlider = this.shadowRoot.getElementById('gradientAngle');
        this.gradientTypeSelect = this.shadowRoot.getElementById('gradientType');
        this.gradientPreview = this.shadowRoot.getElementById('gradientPreview');
        
        // Pattern elements
        this.patternTypeSelect = this.shadowRoot.getElementById('patternType');
        this.patternScaleSlider = this.shadowRoot.getElementById('patternScale');
        
        // Container elements
        this.shapeColorSwatchesContainer = this.shadowRoot.getElementById('shapeColorSwatches');
        this.bgColorSwatchesContainer = this.shadowRoot.getElementById('bgColorSwatches');
        this.solidColorControls = this.shadowRoot.getElementById('solidColorControls');
        this.gradientControls = this.shadowRoot.getElementById('gradientControls');
        this.patternControls = this.shadowRoot.getElementById('patternControls');
        this.customSizeControls = this.shadowRoot.getElementById('customSizeControls');
        
        // Button elements
        this.generateBtn = this.shadowRoot.getElementById('generateBtn');
        this.randomizeGradientBtn = this.shadowRoot.getElementById('randomizeGradientBtn');
        this.gradientBackBtn = this.shadowRoot.getElementById('gradientBackBtn');
        this.swapColorsBtn = this.shadowRoot.getElementById('swapColorsBtn');
        this.addGradientStopBtn = this.shadowRoot.getElementById('addGradientStopBtn');
        this.randomSolidBtn = this.shadowRoot.getElementById('randomSolidBtn');
        this.randomBgBtn = this.shadowRoot.getElementById('randomBgBtn');
        
        // Export elements
        this.exportResolutionSelect = this.shadowRoot.getElementById('exportResolution');
        this.customWidthInput = this.shadowRoot.getElementById('customWidth');
        this.customHeightInput = this.shadowRoot.getElementById('customHeight');
        this.savePngBtn = this.shadowRoot.getElementById('savePngBtn');
        this.saveJpgBtn = this.shadowRoot.getElementById('saveJpgBtn');
        this.saveWebpBtn = this.shadowRoot.getElementById('saveWebpBtn');
        this.saveSvgBtn = this.shadowRoot.getElementById('saveSvgBtn');
        this.savePdfBtn = this.shadowRoot.getElementById('savePdfBtn');
        this.copyHtmlBtn = this.shadowRoot.getElementById('copyHtmlBtn');
        this.batchExportBtn = this.shadowRoot.getElementById('batchExportBtn');
        this.exportProgress = this.shadowRoot.getElementById('exportProgress');
        this.exportProgressFill = this.shadowRoot.getElementById('exportProgressFill');
        
        // Toggle elements
        this.undulationToggle = this.shadowRoot.getElementById('undulationToggle');
        this.transparentToggle = this.shadowRoot.getElementById('transparentToggle');
        this.fillModeRadios = this.shadowRoot.querySelectorAll('input[name="fillMode"]');
        
        // Value span elements
        this.pointsValueSpan = this.shadowRoot.getElementById('pointsValue');
        this.roughnessValueSpan = this.shadowRoot.getElementById('roughnessValue');
        this.animSpeedValueSpan = this.shadowRoot.getElementById('animSpeedValue');
        this.lightingValueSpan = this.shadowRoot.getElementById('lightingValue');
        this.grainValueSpan = this.shadowRoot.getElementById('grainValue');
        this.shadowBlurValueSpan = this.shadowRoot.getElementById('shadowBlurValue');
        this.shadowXValueSpan = this.shadowRoot.getElementById('shadowXValue');
        this.shadowYValueSpan = this.shadowRoot.getElementById('shadowYValue');
        this.saturationValueSpan = this.shadowRoot.getElementById('saturationValue');
        this.gradientAngleValueSpan = this.shadowRoot.getElementById('gradientAngleValue');
        this.patternScaleValueSpan = this.shadowRoot.getElementById('patternScaleValue');
        this.saturationSlider = this.shadowRoot.getElementById('saturation');
        
        this.toast = this.shadowRoot.getElementById('toast');

        // Offscreen canvas for grain texture
        this.grainTextures = [];
        this.NUM_GRAIN_TEXTURES = 20;

        // Enhanced Color Palette
        this.neuColors = [
            '#7c9cbf', '#95a5cf', '#b8a9cf', '#cf9fb8', // Blues to purples
            '#cf9f9f', '#cfa99f', '#cfb89f', '#c9cf9f', // Warm tones
            '#a9cf9f', '#9fcfb8', '#9fc9cf', '#9fb8cf', // Greens to blues
            '#a5a5a5', '#b8b8b8', '#cfcfcf', '#e0e0e0', // Grays
            '#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', // Vibrant colors
            '#a8e6cf', '#ffd3a5', '#fd9853', '#ee6c4d'  // Pastels
        ];
        
        // Enhanced State Object
        this.shapeState = {
            numPoints: 8,
            roughness: 0.4,
            animationSpeed: 1,
            lightingOpacity: 0.5,
            lightingBlendMode: 'hard-light',
            grainOpacity: 0.0,
            grainBlendMode: 'hard-light',
            shadowBlur: 0,
            shadowX: 0,
            shadowY: 0,
            shadowColor: '#000000',
            undulationEnabled: true,
            transparentBackground: false,
            shapeColor: '#7c9cbf',
            bgColor: '#f0f2f5',
            randomSeed: 0,
            fillMode: 'gradient',
            gradient: {
                type: 'linear',
                colors: ['#7c9cbf', '#b8a9cf'],
                angle: 0,
                saturation: 1,
                centerX: 50,
                centerY: 50,
                stops: []
            },
            pattern: {
                type: 'dots',
                scale: 10,
                color1: '#7c9cbf',
                color2: '#ffffff'
            },
            gradientHistory: [],
            gradientHistoryIndex: -1,
            export: {
                resolution: 1024,
                customWidth: 1024,
                customHeight: 1024
            },
            // Animation state
            animationStartTime: 0,
            animationDuration: 800,
            currentVertices: [],
            targetVertices: [],
            lastRenderedVertices: [],
        };

        this.initializeControls();
    }

    initializeControls() {
        // Set initial values
        this.pointsSlider.value = this.shapeState.numPoints;
        this.roughnessSlider.value = this.shapeState.roughness;
        this.animSpeedSlider.value = this.shapeState.animationSpeed;
        this.lightingSlider.value = this.shapeState.lightingOpacity;
        this.lightingBlendModeSelect.value = this.shapeState.lightingBlendMode;
        this.grainSlider.value = this.shapeState.grainOpacity;
        this.grainBlendModeSelect.value = this.shapeState.grainBlendMode;
        this.shadowBlurSlider.value = this.shapeState.shadowBlur;
        this.shadowXSlider.value = this.shapeState.shadowX;
        this.shadowYSlider.value = this.shapeState.shadowY;
        this.shadowColorPicker.value = this.shapeState.shadowColor;
        
        this.undulationToggle.querySelector('input').checked = this.shapeState.undulationEnabled;
        this.transparentToggle.querySelector('input').checked = this.shapeState.transparentBackground;
        
        this.shapeColorPicker.value = this.shapeState.shapeColor;
        this.bgColorPicker.value = this.shapeState.bgColor;
        this.gradientColor1.value = this.shapeState.gradient.colors[0];
        this.gradientColor2.value = this.shapeState.gradient.colors[1];
        this.gradientAngleSlider.value = this.shapeState.gradient.angle;
        this.gradientTypeSelect.value = this.shapeState.gradient.type;
        this.saturationSlider.value = this.shapeState.gradient.saturation;
        this.patternTypeSelect.value = this.shapeState.pattern.type;
        this.patternScaleSlider.value = this.shapeState.pattern.scale;
        this.exportResolutionSelect.value = this.shapeState.export.resolution;
        
        // Set value spans
        this.pointsValueSpan.textContent = this.shapeState.numPoints;
        this.roughnessValueSpan.textContent = this.shapeState.roughness;
        this.animSpeedValueSpan.textContent = this.shapeState.animationSpeed;
        this.lightingValueSpan.textContent = this.shapeState.lightingOpacity;
        this.grainValueSpan.textContent = this.shapeState.grainOpacity;
        this.shadowBlurValueSpan.textContent = this.shapeState.shadowBlur;
        this.shadowXValueSpan.textContent = this.shapeState.shadowX;
        this.shadowYValueSpan.textContent = this.shapeState.shadowY;
        this.saturationValueSpan.textContent = this.shapeState.gradient.saturation;
        this.gradientAngleValueSpan.textContent = this.shapeState.gradient.angle;
        this.patternScaleValueSpan.textContent = this.shapeState.pattern.scale;

        this.createColorSwatches(this.shapeColorSwatchesContainer, 'shapeColor');
        this.createColorSwatches(this.bgColorSwatchesContainer, 'bgColor');
        this.updateSelectedSwatch(this.shapeColorSwatchesContainer, this.shapeState.shapeColor);
        this.updateSelectedSwatch(this.bgColorSwatchesContainer, this.shapeState.bgColor);

        this.handleFillModeChange({ target: { value: this.shapeState.fillMode } });
        this.updateGradientPreview();
    }

    bindEvents() {
        // Slider events
        this.pointsSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.roughnessSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.animSpeedSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.saturationSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.lightingSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.grainSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.shadowBlurSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.shadowXSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.shadowYSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.gradientAngleSlider.addEventListener('input', this.handleInputChange.bind(this));
        this.patternScaleSlider.addEventListener('input', this.handleInputChange.bind(this));
        
        // Select events
        this.lightingBlendModeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.grainBlendModeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.gradientTypeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.patternTypeSelect.addEventListener('change', this.handleInputChange.bind(this));
        this.exportResolutionSelect.addEventListener('change', this.handleExportResolutionChange.bind(this));
        
        // Color picker events
        this.shapeColorPicker.addEventListener('input', this.handleColorPickerChange.bind(this));
        this.bgColorPicker.addEventListener('input', this.handleColorPickerChange.bind(this));
        this.gradientColor1.addEventListener('input', this.handleGradientColorChange.bind(this));
        this.gradientColor2.addEventListener('input', this.handleGradientColorChange.bind(this));
        this.shadowColorPicker.addEventListener('input', this.handleInputChange.bind(this));
        
        // Toggle events
        this.undulationToggle.addEventListener('click', this.handleUndulationToggle.bind(this));
        this.transparentToggle.addEventListener('click', this.handleTransparentToggle.bind(this));
        
        // Button events
        this.generateBtn.addEventListener('click', this.handleGenerateClick.bind(this));
        this.randomizeGradientBtn.addEventListener('click', this.randomizeGradient.bind(this));
        this.gradientBackBtn.addEventListener('click', this.handleGradientBack.bind(this));
        this.swapColorsBtn.addEventListener('click', this.handleSwapColors.bind(this));
        this.addGradientStopBtn.addEventListener('click', this.handleAddGradientStop.bind(this));
        this.randomSolidBtn.addEventListener('click', this.handleRandomSolid.bind(this));
        this.randomBgBtn.addEventListener('click', this.handleRandomBg.bind(this));
        
        // Export events
        this.savePngBtn.addEventListener('click', () => this.handleSaveImage('png'));
        this.saveJpgBtn.addEventListener('click', () => this.handleSaveImage('jpg'));
        this.saveWebpBtn.addEventListener('click', () => this.handleSaveImage('webp'));
        this.saveSvgBtn.addEventListener('click', this.handleSaveSvg.bind(this));
        this.savePdfBtn.addEventListener('click', this.handleSavePdf.bind(this));
        this.copyHtmlBtn.addEventListener('click', this.handleCopyHtml.bind(this));
        this.batchExportBtn.addEventListener('click', this.handleBatchExport.bind(this));
        
        // Fill mode events
        this.fillModeRadios.forEach(radio => radio.addEventListener('change', this.handleFillModeChange.bind(this)));
        
        // Window events
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Editable span events
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

    handleTransparentToggle() {
        const checkbox = this.transparentToggle.querySelector('input');
        checkbox.checked = !checkbox.checked;
        this.shapeState.transparentBackground = checkbox.checked;
        this.transparentToggle.classList.toggle('active', checkbox.checked);
    }

    handleColorPickerChange(e) {
        const { id, value } = e.target;
        if (id === 'shapeColorPicker') {
            this.shapeState.shapeColor = value;
            this.updateSelectedSwatch(this.shapeColorSwatchesContainer, value);
        } else if (id === 'bgColorPicker') {
            this.shapeState.bgColor = value;
            this.updateSelectedSwatch(this.bgColorSwatchesContainer, value);
        }
    }

    handleGradientColorChange(e) {
        const { id, value } = e.target;
        if (id === 'gradientColor1') {
            this.shapeState.gradient.colors[0] = value;
        } else if (id === 'gradientColor2') {
            this.shapeState.gradient.colors[1] = value;
        }
        this.updateGradientPreview();
    }

    handleSwapColors() {
        const temp = this.shapeState.gradient.colors[0];
        this.shapeState.gradient.colors[0] = this.shapeState.gradient.colors[1];
        this.shapeState.gradient.colors[1] = temp;
        this.gradientColor1.value = this.shapeState.gradient.colors[0];
        this.gradientColor2.value = this.shapeState.gradient.colors[1];
        this.updateGradientPreview();
    }

    handleAddGradientStop() {
        // For now, just randomize - in full implementation would add third color
        this.randomizeGradient();
        this.showToast('Gradient randomized! Multi-stop gradients coming soon.');
    }

    handleRandomSolid() {
        const randomColor = this.neuColors[Math.floor(Math.random() * this.neuColors.length)];
        this.shapeState.shapeColor = randomColor;
        this.shapeColorPicker.value = randomColor;
        this.updateSelectedSwatch(this.shapeColorSwatchesContainer, randomColor);
    }

    handleRandomBg() {
        const randomColor = this.neuColors[Math.floor(Math.random() * this.neuColors.length)];
        this.shapeState.bgColor = randomColor;
        this.bgColorPicker.value = randomColor;
        this.updateSelectedSwatch(this.bgColorSwatchesContainer, randomColor);
    }

    handleExportResolutionChange(e) {
        const value = e.target.value;
        this.shapeState.export.resolution = value;
        if (value === 'custom') {
            this.customSizeControls.classList.remove('hidden');
        } else {
            this.customSizeControls.classList.add('hidden');
        }
    }

    updateGradientPreview() {
        const { type, colors, angle } = this.shapeState.gradient;
        let gradientCss;
        
        switch (type) {
            case 'linear':
                gradientCss = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
                break;
            case 'radial':
                gradientCss = `radial-gradient(circle, ${colors[0]}, ${colors[1]})`;
                break;
            case 'conic':
                gradientCss = `conic-gradient(from ${angle}deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
                break;
        }
        
        this.gradientPreview.style.background = gradientCss;
    }

    // Core Drawing & Animation Logic (Enhanced)
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

    createFillStyle(targetCtx, box) {
        const { fillMode, shapeColor, gradient, pattern } = this.shapeState;
        
        switch (fillMode) {
            case 'solid':
                return shapeColor;
            
            case 'gradient':
                return this.createGradient(targetCtx, box);
            
            case 'pattern':
                return this.createPattern(targetCtx);
            
            default:
                return shapeColor;
        }
    }

    createGradient(targetCtx, box) {
        const { type, colors, angle, centerX, centerY } = this.shapeState.gradient;
        const boxCenterX = box.minX + (box.maxX - box.minX) / 2;
        const boxCenterY = box.minY + (box.maxY - box.minY) / 2;
        
        let gradient;
        
        switch (type) {
            case 'linear':
                const angleRad = angle * (Math.PI / 180);
                const halfWidth = (box.maxX - box.minX) / 2;
                const halfHeight = (box.maxY - box.minY) / 2;
                const length = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
                const x0 = boxCenterX - Math.cos(angleRad) * length;
                const y0 = boxCenterY - Math.sin(angleRad) * length;
                const x1 = boxCenterX + Math.cos(angleRad) * length;
                const y1 = boxCenterY + Math.sin(angleRad) * length;
                gradient = targetCtx.createLinearGradient(x0, y0, x1, y1);
                break;
            
            case 'radial':
                const radius = Math.max(box.maxX - box.minX, box.maxY - box.minY) / 2;
                gradient = targetCtx.createRadialGradient(boxCenterX, boxCenterY, 0, boxCenterX, boxCenterY, radius);
                break;
            
            case 'conic':
                // Fallback to linear for browsers that don't support conic
                const conicAngleRad = angle * (Math.PI / 180);
                const conicLength = Math.sqrt((box.maxX - box.minX) ** 2 + (box.maxY - box.minY) ** 2) / 2;
                const cx0 = boxCenterX - Math.cos(conicAngleRad) * conicLength;
                const cy0 = boxCenterY - Math.sin(conicAngleRad) * conicLength;
                const cx1 = boxCenterX + Math.cos(conicAngleRad) * conicLength;
                const cy1 = boxCenterY + Math.sin(conicAngleRad) * conicLength;
                gradient = targetCtx.createLinearGradient(cx0, cy0, cx1, cy1);
                break;
        }
        
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }

    createPattern(targetCtx) {
        const { type, scale, color1, color2 } = this.shapeState.pattern;
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        
        patternCanvas.width = scale * 2;
        patternCanvas.height = scale * 2;
        
        switch (type) {
            case 'dots':
                patternCtx.fillStyle = color2 || '#ffffff';
                patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
                patternCtx.fillStyle = color1 || this.shapeState.shapeColor;
                patternCtx.beginPath();
                patternCtx.arc(scale, scale, scale * 0.3, 0, Math.PI * 2);
                patternCtx.fill();
                break;
            
            case 'lines':
                patternCtx.fillStyle = color2 || '#ffffff';
                patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
                patternCtx.strokeStyle = color1 || this.shapeState.shapeColor;
                patternCtx.lineWidth = 2;
                patternCtx.beginPath();
                patternCtx.moveTo(0, 0);
                patternCtx.lineTo(patternCanvas.width, patternCanvas.height);
                patternCtx.stroke();
                break;
            
            case 'grid':
                patternCtx.fillStyle = color2 || '#ffffff';
                patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
                patternCtx.strokeStyle = color1 || this.shapeState.shapeColor;
                patternCtx.lineWidth = 1;
                patternCtx.beginPath();
                patternCtx.moveTo(scale, 0);
                patternCtx.lineTo(scale, patternCanvas.height);
                patternCtx.moveTo(0, scale);
                patternCtx.lineTo(patternCanvas.width, scale);
                patternCtx.stroke();
                break;
            
            case 'noise':
                const imageData = patternCtx.createImageData(patternCanvas.width, patternCanvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const val = Math.random() * 255;
                    data[i] = val;
                    data[i + 1] = val;
                    data[i + 2] = val;
                    data[i + 3] = 100;
                }
                patternCtx.putImageData(imageData, 0, 0);
                break;
        }
        
        return targetCtx.createPattern(patternCanvas, 'repeat');
    }

    drawShape(targetCtx, vertices, fillStyle, box, grainTexture) {
        // Apply shadow if enabled
        if (this.shapeState.shadowBlur > 0) {
            targetCtx.shadowColor = this.shapeState.shadowColor;
            targetCtx.shadowBlur = this.shapeState.shadowBlur;
            targetCtx.shadowOffsetX = this.shapeState.shadowX;
            targetCtx.shadowOffsetY = this.shapeState.shadowY;
        }

        this.createShapePath(targetCtx, vertices);
        targetCtx.fillStyle = fillStyle;
        targetCtx.fill();

        // Reset shadow
        targetCtx.shadowColor = 'transparent';
        targetCtx.shadowBlur = 0;
        targetCtx.shadowOffsetX = 0;
        targetCtx.shadowOffsetY = 0;

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
        if (!this.isConnected) return;
        
        requestAnimationFrame(this.animate.bind(this));
        if (!this.shapeState.animationStartTime) this.shapeState.animationStartTime = timestamp;

        const elapsedTime = timestamp - this.shapeState.animationStartTime;
        const adjustedDuration = this.shapeState.animationDuration / this.shapeState.animationSpeed;
        const progress = Math.min(elapsedTime / adjustedDuration, 1);
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
            const undulationSpeed = 0.0015 * this.shapeState.animationSpeed;
            finalVertices = frameVertices.map((v, i) => ({
                x: v.x + Math.sin(timestamp * undulationSpeed + i * 2) * undulationAmount,
                y: v.y + Math.cos(timestamp * undulationSpeed + i * 2) * undulationAmount
            }));
        }
        
        this.shapeState.lastRenderedVertices = finalVertices;

        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = this.canvas.width / dpr;
        const logicalHeight = this.canvas.height / dpr;

        // Clear canvas
        this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Draw background (unless transparent)
        if (!this.shapeState.transparentBackground) {
            this.ctx.fillStyle = this.shapeState.bgColor;
            this.ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        }

        const padding = 20;
        const box = this.getBoundingBox(finalVertices);
        const boxWidth = box.maxX - box.minX;
        const boxHeight = box.maxY - box.minY;
        const boxCenterX = box.minX + boxWidth / 2;
        const boxCenterY = box.minY + boxHeight / 2;

        const scaleX = (logicalWidth - padding * 2) / boxWidth;
        const scaleY = (logicalHeight - padding * 2) / boxHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply saturation filter
        this.ctx.filter = `saturate(${this.shapeState.gradient.saturation})`;

        // Select current grain texture for this frame (10fps)
        const grainIndex = Math.floor(timestamp / 100) % this.NUM_GRAIN_TEXTURES;
        const currentGrainTexture = this.grainTextures[grainIndex];

        this.ctx.save();
        this.ctx.translate(logicalWidth / 2, logicalHeight / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-boxCenterX, -boxCenterY);
        
        const fillStyle = this.createFillStyle(this.ctx, box);
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
            ...this.shapeState.gradient,
            colors: shuffled.slice(0, 2),
            angle: Math.random() * 360
        };

        if (this.shapeState.gradientHistoryIndex < this.shapeState.gradientHistory.length - 1) {
            this.shapeState.gradientHistory = this.shapeState.gradientHistory.slice(0, this.shapeState.gradientHistoryIndex + 1);
        }
        
        this.shapeState.gradientHistory.push(newGradient);
        this.shapeState.gradientHistoryIndex = this.shapeState.gradientHistory.length - 1;
        this.shapeState.gradient = newGradient;

        // Update UI
        this.gradientColor1.value = newGradient.colors[0];
        this.gradientColor2.value = newGradient.colors[1];
        this.gradientAngleSlider.value = newGradient.angle;
        this.gradientAngleValueSpan.textContent = newGradient.angle;

        this.updateGradientButtonsState();
        this.updateGradientPreview();
    }
    
    handleGradientBack() {
        if (this.shapeState.gradientHistoryIndex > 0) {
            this.shapeState.gradientHistoryIndex--;
            this.shapeState.gradient = this.shapeState.gradientHistory[this.shapeState.gradientHistoryIndex];
            
            this.gradientColor1.value = this.shapeState.gradient.colors[0];
            this.gradientColor2.value = this.shapeState.gradient.colors[1];
            this.gradientAngleSlider.value = this.shapeState.gradient.angle;
            this.gradientAngleValueSpan.textContent = this.shapeState.gradient.angle;
            this.saturationSlider.value = this.shapeState.gradient.saturation;
            this.saturationValueSpan.textContent = this.shapeState.gradient.saturation;

            this.updateGradientButtonsState();
            this.updateGradientPreview();
        }
    }

    // Enhanced Export Functions
    getExportDimensions() {
        const resolution = this.shapeState.export.resolution;
        if (resolution === 'custom') {
            return {
                width: parseInt(this.customWidthInput.value) || 1024,
                height: parseInt(this.customHeightInput.value) || 1024
            };
        }
        const size = parseInt(resolution);
        return { width: size, height: size };
    }

    async handleSaveImage(format) {
        const vertices = this.shapeState.lastRenderedVertices;
        if (vertices.length < 2) return;

        const { width, height } = this.getExportDimensions();
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        await this.renderToCanvas(tempCtx, vertices, width, height);

        let mimeType, filename;
        switch (format) {
            case 'jpg':
                mimeType = 'image/jpeg';
                filename = 'shape.jpg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                filename = 'shape.webp';
                break;
            default:
                mimeType = 'image/png';
                filename = 'shape.png';
        }

        const dataUrl = tempCanvas.toDataURL(mimeType, 0.9);
        this.downloadFile(dataUrl, filename);
        this.showToast(`${format.toUpperCase()} saved successfully!`);
    }

    async renderToCanvas(targetCtx, vertices, width, height) {
        // Clear canvas
        targetCtx.clearRect(0, 0, width, height);
        
        // Draw background (unless transparent)
        if (!this.shapeState.transparentBackground) {
            targetCtx.fillStyle = this.shapeState.bgColor;
            targetCtx.fillRect(0, 0, width, height);
        }

        const padding = 50;
        const box = this.getBoundingBox(vertices);
        const boxWidth = box.maxX - box.minX;
        const boxHeight = box.maxY - box.minY;
        const boxCenterX = box.minX + boxWidth / 2;
        const boxCenterY = box.minY + boxHeight / 2;

        const scaleX = (width - padding * 2) / boxWidth;
        const scaleY = (height - padding * 2) / boxHeight;
        const scale = Math.min(scaleX, scaleY);

        // Apply saturation filter
        targetCtx.filter = `saturate(${this.shapeState.gradient.saturation})`;

        targetCtx.save();
        targetCtx.translate(width / 2, height / 2);
        targetCtx.scale(scale, scale);
        targetCtx.translate(-boxCenterX, -boxCenterY);
        
        const fillStyle = this.createFillStyle(targetCtx, box);
        this.drawShape(targetCtx, vertices, fillStyle, box, this.grainTextures[0]);
        
        targetCtx.restore();
        targetCtx.filter = 'none';
    }

    handleSavePdf() {
        // For PDF export, we'll use SVG data and create a downloadable link
        // In a real implementation, you'd use a PDF library like jsPDF
        const svgString = this.generateFullSvgString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, 'shape.svg'); // Fallback to SVG for now
        this.showToast('SVG exported (PDF generation requires additional library)');
    }

    async handleBatchExport() {
        const formats = ['png', 'jpg', 'webp', 'svg'];
        this.exportProgress.classList.remove('hidden');
        
        for (let i = 0; i < formats.length; i++) {
            const progress = ((i + 1) / formats.length) * 100;
            this.exportProgressFill.style.width = `${progress}%`;
            
            if (formats[i] === 'svg') {
                this.handleSaveSvg();
            } else {
                await this.handleSaveImage(formats[i]);
            }
            
            // Small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setTimeout(() => {
            this.exportProgress.classList.add('hidden');
            this.exportProgressFill.style.width = '0%';
        }, 1000);
        
        this.showToast('Batch export completed!');
    }

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

        let fillAttr = this.shapeState.shapeColor;
        let defs = '';
        let filterAttr = '';
        let lightingLayer = '';
        let grainLayer = '';

        // Handle different fill modes
        if (this.shapeState.fillMode === 'gradient') {
            const { type, colors, angle } = this.shapeState.gradient;
            
            if (type === 'linear') {
                const gradX1 = 50 - Math.cos(angle * Math.PI / 180) * 50;
                const gradY1 = 50 - Math.sin(angle * Math.PI / 180) * 50;
                const gradX2 = 50 + Math.cos(angle * Math.PI / 180) * 50;
                const gradY2 = 50 + Math.sin(angle * Math.PI / 180) * 50;
                defs += `
            <linearGradient id="shape-gradient" x1="${gradX1.toFixed(2)}%" y1="${gradY1.toFixed(2)}%" x2="${gradX2.toFixed(2)}%" y2="${gradY2.toFixed(2)}%">
                <stop offset="0%" stop-color="${colors[0]}" />
                <stop offset="100%" stop-color="${colors[1]}" />
            </linearGradient>`;
            } else if (type === 'radial') {
                defs += `
            <radialGradient id="shape-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${colors[0]}" />
                <stop offset="100%" stop-color="${colors[1]}" />
            </radialGradient>`;
            }
            
            fillAttr = 'url(#shape-gradient)';
            
            if (this.shapeState.gradient.saturation !== 1) {
                defs += `
            <filter id="saturate">
                <feColorMatrix type="saturate" values="${this.shapeState.gradient.saturation}" />
            </filter>`;
                filterAttr = 'filter="url(#saturate)"';
            }
        }

        // Add lighting effect
        if (this.shapeState.lightingOpacity > 0) {
            defs += `
        <linearGradient id="lighting-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="white" />
            <stop offset="100%" stop-color="black" />
        </linearGradient>`;
            lightingLayer = `<path d="${pathData}" fill="url(#lighting-gradient)" style="mix-blend-mode: ${this.shapeState.lightingBlendMode}; opacity: ${this.shapeState.lightingOpacity};" />`;
        }

        // Add grain effect
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
        this.downloadFile(url, 'shape.svg');
        URL.revokeObjectURL(url);
        this.showToast('SVG saved successfully!');
    }

    handleCopyHtml() {
        const htmlString = this.generateFullSvgString();
        navigator.clipboard.writeText(htmlString).then(() => {
            this.showToast('SVG code copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = htmlString;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('SVG code copied to clipboard!');
        });
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
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
        
        // Regenerate grain texture on resize
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
        
        // Handle sliders
        if (id === 'points' || id === 'roughness') {
            const property = (id === 'points') ? 'numPoints' : 'roughness';
            this.shapeState[property] = parseFloat(value);
            this.shadowRoot.getElementById(`${id}Value`).textContent = value;
            this.triggerShapeGeneration();
        } else if (id === 'animSpeed') {
            this.shapeState.animationSpeed = parseFloat(value);
            this.animSpeedValueSpan.textContent = value;
        } else if (id === 'saturation') {
            this.shapeState.gradient.saturation = parseFloat(value);
            this.saturationValueSpan.textContent = value;
            this.updateGradientPreview();
        } else if (id === 'lighting') {
            this.shapeState.lightingOpacity = parseFloat(value);
            this.lightingValueSpan.textContent = value;
        } else if (id === 'grain') {
            this.shapeState.grainOpacity = parseFloat(value);
            this.grainValueSpan.textContent = value;
        } else if (id === 'shadowBlur') {
            this.shapeState.shadowBlur = parseFloat(value);
            this.shadowBlurValueSpan.textContent = value;
        } else if (id === 'shadowX') {
            this.shapeState.shadowX = parseFloat(value);
            this.shadowXValueSpan.textContent = value;
        } else if (id === 'shadowY') {
            this.shapeState.shadowY = parseFloat(value);
            this.shadowYValueSpan.textContent = value;
        } else if (id === 'shadowColorPicker') {
            this.shapeState.shadowColor = value;
        } else if (id === 'gradientAngle') {
            this.shapeState.gradient.angle = parseFloat(value);
            this.gradientAngleValueSpan.textContent = value;
            this.updateGradientPreview();
        } else if (id === 'patternScale') {
            this.shapeState.pattern.scale = parseFloat(value);
            this.patternScaleValueSpan.textContent = value;
        } else if (id === 'grainBlendMode') {
            this.shapeState.grainBlendMode = value;
        } else if (id === 'lightingBlendMode') {
            this.shapeState.lightingBlendMode = value;
        } else if (id === 'gradientType') {
            this.shapeState.gradient.type = value;
            this.updateGradientPreview();
        } else if (id === 'patternType') {
            this.shapeState.pattern.type = value;
        }
    }

    handleGenerateClick() {
        this.shapeState.randomSeed = Math.random() * 1000;
        this.triggerShapeGeneration();
    }

    handleFillModeChange(e) {
        this.shapeState.fillMode = e.target.value;
        
        // Hide all controls first
        this.solidColorControls.classList.add('hidden');
        this.gradientControls.classList.add('hidden');
        this.patternControls.classList.add('hidden');
        
        // Show relevant controls
        if (this.shapeState.fillMode === 'solid') {
            this.solidColorControls.classList.remove('hidden');
        } else if (this.shapeState.fillMode === 'gradient') {
            this.gradientControls.classList.remove('hidden');
        } else if (this.shapeState.fillMode === 'pattern') {
            this.patternControls.classList.remove('hidden');
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
                
                // Update color picker if it exists
                if (property === 'shapeColor' && this.shapeColorPicker) {
                    this.shapeColorPicker.value = color;
                } else if (property === 'bgColor' && this.bgColorPicker) {
                    this.bgColorPicker.value = color;
                }
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
