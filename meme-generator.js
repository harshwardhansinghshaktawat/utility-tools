class MemeGenerator extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        this._currentTemplate = null;
        this._textLayers = [];
        this._selectedLayer = null;
        this._isDragging = false;
        this._dragOffset = { x: 0, y: 0 };
        this._canvas = null;
        this._ctx = null;
        this._history = [];
        this._historyIndex = -1;
        this._filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            sepia: 0,
            grayscale: 0,
            blur: 0
        };
        
        this._root = document.createElement('div');
        this._root.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Anton&family=Impact&family=Comic+Neue:wght@400;700&family=Bangers&family=Creepster&family=Fredoka+One&display=swap');
                
                :host {
                    --primary-color: #ff6b6b;
                    --secondary-color: #4ecdc4;
                    --accent-color: #45b7d1;
                    --background-color: #f8f9fa;
                    --text-color: #343a40;
                    --border-color: #dee2e6;
                    --success-color: #28a745;
                    --warning-color: #ffc107;
                    --danger-color: #dc3545;
                    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: 'Poppins', sans-serif;
                    background: var(--background-color);
                    overflow: hidden;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                .meme-generator-container {
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    background: var(--background-color);
                }
                
                /* Left Panel - Tools */
                .tools-panel {
                    width: 300px;
                    background: white;
                    border-right: 2px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow);
                    z-index: 100;
                }
                
                .panel-header {
                    padding: 20px;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    color: white;
                    text-align: center;
                }
                
                .panel-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }
                
                .panel-subtitle {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin: 5px 0 0 0;
                }
                
                .tools-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary-color) var(--border-color);
                }
                
                .tools-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                .tools-content::-webkit-scrollbar-track {
                    background: var(--border-color);
                }
                
                .tools-content::-webkit-scrollbar-thumb {
                    background: var(--primary-color);
                    border-radius: 3px;
                }
                
                .tool-section {
                    margin-bottom: 25px;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                }
                
                .tool-section-header {
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    padding: 12px 16px;
                    font-weight: 600;
                    color: var(--text-color);
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.2s ease;
                }
                
                .tool-section-header:hover {
                    background: linear-gradient(135deg, #e9ecef, #dee2e6);
                }
                
                .tool-section-content {
                    padding: 16px;
                }
                
                .tool-section.collapsed .tool-section-content {
                    display: none;
                }
                
                .chevron {
                    transition: transform 0.2s ease;
                    font-size: 0.8rem;
                }
                
                .tool-section.collapsed .chevron {
                    transform: rotate(-90deg);
                }
                
                /* Form Controls */
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: var(--text-color);
                    font-size: 0.9rem;
                }
                
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                    background: white;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
                }
                
                .color-input {
                    height: 40px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    box-shadow: var(--shadow);
                }
                
                .range-input {
                    -webkit-appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--border-color);
                    outline: none;
                }
                
                .range-input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    box-shadow: var(--shadow);
                }
                
                .range-input::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    box-shadow: var(--shadow);
                    border: none;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    gap: 6px;
                }
                
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #ff5252;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }
                
                .btn-secondary {
                    background: var(--secondary-color);
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #26a69a;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }
                
                .btn-success {
                    background: var(--success-color);
                    color: white;
                }
                
                .btn-success:hover {
                    background: #218838;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }
                
                .btn-danger {
                    background: var(--danger-color);
                    color: white;
                }
                
                .btn-danger:hover {
                    background: #c82333;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }
                
                .btn-outline {
                    background: transparent;
                    color: var(--primary-color);
                    border: 1px solid var(--primary-color);
                }
                
                .btn-outline:hover {
                    background: var(--primary-color);
                    color: white;
                }
                
                .btn-sm {
                    padding: 6px 12px;
                    font-size: 0.8rem;
                }
                
                .btn-group {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                /* Font Selection */
                .font-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .font-option {
                    padding: 8px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.8rem;
                }
                
                .font-option:hover {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 107, 0.1);
                }
                
                .font-option.active {
                    border-color: var(--primary-color);
                    background: var(--primary-color);
                    color: white;
                }
                
                /* Text Layers List */
                .text-layers {
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .text-layer-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }
                
                .text-layer-item:hover {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 107, 0.05);
                }
                
                .text-layer-item.active {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 107, 0.1);
                }
                
                .text-layer-preview {
                    flex: 1;
                    font-size: 0.8rem;
                    color: var(--text-color);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .text-layer-actions {
                    display: flex;
                    gap: 4px;
                }
                
                .action-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    border-radius: 4px;
                    background: var(--border-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .action-btn:hover {
                    background: var(--primary-color);
                    color: white;
                }
                
                /* Main Canvas Area */
                .canvas-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #f5f5f5;
                    position: relative;
                }
                
                .canvas-toolbar {
                    background: white;
                    padding: 15px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: var(--shadow);
                }
                
                .canvas-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .canvas-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    overflow: auto;
                }
                
                .canvas-wrapper {
                    position: relative;
                    background: white;
                    box-shadow: var(--shadow-lg);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .meme-canvas {
                    display: block;
                    max-width: 100%;
                    max-height: calc(100vh - 200px);
                    cursor: crosshair;
                }
                
                /* Text Layer Overlay */
                .text-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                
                .text-layer {
                    position: absolute;
                    cursor: move;
                    pointer-events: auto;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 50px;
                    min-height: 30px;
                    border: 2px dashed transparent;
                    border-radius: 4px;
                    transition: border-color 0.2s ease;
                }
                
                .text-layer:hover {
                    border-color: var(--primary-color);
                }
                
                .text-layer.selected {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
                }
                
                .text-content {
                    text-align: center;
                    word-wrap: break-word;
                    line-height: 1.2;
                    pointer-events: none;
                }
                
                /* Resize Handles */
                .resize-handle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: var(--primary-color);
                    border: 1px solid white;
                    border-radius: 50%;
                    cursor: nw-resize;
                }
                
                .resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
                .resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
                .resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
                .resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }
                
                /* Template Selection Modal */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal.show {
                    display: flex;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                }
                
                .modal-header {
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    color: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s ease;
                }
                
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .modal-body {
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }
                
                .template-item {
                    border: 2px solid var(--border-color);
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }
                
                .template-item:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }
                
                .template-image {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                }
                
                .template-info {
                    padding: 12px;
                    text-align: center;
                }
                
                .template-name {
                    font-weight: 500;
                    color: var(--text-color);
                    font-size: 0.9rem;
                    margin: 0;
                }
                
                /* Export Options */
                .export-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                /* Responsive Design */
                @media (max-width: 1024px) {
                    .meme-generator-container {
                        flex-direction: column;
                        height: auto;
                        min-height: 100vh;
                    }
                    
                    .tools-panel {
                        width: 100%;
                        order: 2;
                        border-right: none;
                        border-top: 2px solid var(--border-color);
                    }
                    
                    .canvas-area {
                        order: 1;
                    }
                    
                    .tools-content {
                        max-height: 300px;
                    }
                }
                
                @media (max-width: 768px) {
                    .canvas-toolbar {
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    
                    .canvas-controls {
                        flex-wrap: wrap;
                    }
                    
                    .template-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                        gap: 15px;
                    }
                    
                    .template-image {
                        height: 120px;
                    }
                    
                    .modal-content {
                        margin: 10px;
                        max-width: calc(100% - 20px);
                        max-height: calc(100% - 20px);
                    }
                }
                
                /* Loading State */
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: var(--text-color);
                }
                
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--border-color);
                    border-top: 2px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 10px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Success/Error Messages */
                .alert {
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                    font-size: 0.9rem;
                }
                
                .alert-success {
                    background: rgba(40, 167, 69, 0.1);
                    color: var(--success-color);
                    border: 1px solid rgba(40, 167, 69, 0.2);
                }
                
                .alert-danger {
                    background: rgba(220, 53, 69, 0.1);
                    color: var(--danger-color);
                    border: 1px solid rgba(220, 53, 69, 0.2);
                }
                
                /* Tooltip */
                .tooltip {
                    position: relative;
                    cursor: help;
                }
                
                .tooltip::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    bottom: 120%;
                    left: 50%;
                    transform: translateX(-50%);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                    z-index: 1000;
                }
                
                .tooltip:hover::after {
                    opacity: 1;
                }
            </style>
            
            <div class="meme-generator-container">
                <!-- Left Tools Panel -->
                <div class="tools-panel">
                    <div class="panel-header">
                        <h1 class="panel-title">Meme Generator</h1>
                        <p class="panel-subtitle">Create viral memes with ease</p>
                    </div>
                    
                    <div class="tools-content">
                        <!-- Template Selection -->
                        <div class="tool-section">
                            <div class="tool-section-header" data-section="template">
                                <span>📸 Template</span>
                                <span class="chevron">▼</span>
                            </div>
                            <div class="tool-section-content">
                                <button class="btn btn-primary" id="selectTemplateBtn" style="width: 100%">
                                    Choose Template
                                </button>
                                <button class="btn btn-outline btn-sm" id="uploadImageBtn" style="width: 100%; margin-top: 8px">
                                    Upload Custom Image
                                </button>
                                <input type="file" id="imageUpload" accept="image/*" style="display: none">
                            </div>
                        </div>
                        
                        <!-- Text Tools -->
                        <div class="tool-section">
                            <div class="tool-section-header" data-section="text">
                                <span>📝 Text</span>
                                <span class="chevron">▼</span>
                            </div>
                            <div class="tool-section-content">
                                <div class="form-group">
                                    <label class="form-label">Text Content</label>
                                    <textarea class="form-control" id="textContent" rows="3" placeholder="Enter your meme text..."></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Font Family</label>
                                    <select class="form-control" id="fontFamily">
                                        <option value="Impact">Impact</option>
                                        <option value="Arial Black">Arial Black</option>
                                        <option value="Anton">Anton</option>
                                        <option value="Bangers">Bangers</option>
                                        <option value="Comic Neue">Comic Neue</option>
                                        <option value="Fredoka One">Fredoka One</option>
                                        <option value="Creepster">Creepster</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Font Size: <span id="fontSizeValue">32</span>px</label>
                                    <input type="range" class="range-input" id="fontSize" min="12" max="120" value="32">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Text Color</label>
                                    <input type="color" class="color-input form-control" id="textColor" value="#ffffff">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Stroke Color</label>
                                    <input type="color" class="color-input form-control" id="strokeColor" value="#000000">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Stroke Width: <span id="strokeWidthValue">3</span>px</label>
                                    <input type="range" class="range-input" id="strokeWidth" min="0" max="10" value="3">
                                </div>
                                
                                <div class="btn-group">
                                    <button class="btn btn-primary" id="addTextBtn">Add Text</button>
                                    <button class="btn btn-secondary" id="updateTextBtn">Update</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Text Layers -->
                        <div class="tool-section">
                            <div class="tool-section-header" data-section="layers">
                                <span>📚 Text Layers</span>
                                <span class="chevron">▼</span>
                            </div>
                            <div class="tool-section-content">
                                <div class="text-layers" id="textLayers">
                                    <p style="color: #666; font-size: 0.9rem; text-align: center; padding: 20px;">
                                        No text layers yet. Add some text to get started!
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Image Filters -->
                        <div class="tool-section">
                            <div class="tool-section-header" data-section="filters">
                                <span>🎨 Image Filters</span>
                                <span class="chevron">▼</span>
                            </div>
                            <div class="tool-section-content">
                                <div class="form-group">
                                    <label class="form-label">Brightness: <span id="brightnessValue">100</span>%</label>
                                    <input type="range" class="range-input" id="brightness" min="0" max="200" value="100">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Contrast: <span id="contrastValue">100</span>%</label>
                                    <input type="range" class="range-input" id="contrast" min="0" max="200" value="100">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Saturation: <span id="saturateValue">100</span>%</label>
                                    <input type="range" class="range-input" id="saturate" min="0" max="200" value="100">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Sepia: <span id="sepiaValue">0</span>%</label>
                                    <input type="range" class="range-input" id="sepia" min="0" max="100" value="0">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Grayscale: <span id="grayscaleValue">0</span>%</label>
                                    <input type="range" class="range-input" id="grayscale" min="0" max="100" value="0">
                                </div>
                                
                                <div class="btn-group">
                                    <button class="btn btn-outline" id="resetFiltersBtn">Reset Filters</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Export -->
                        <div class="tool-section">
                            <div class="tool-section-header" data-section="export">
                                <span>💾 Export</span>
                                <span class="chevron">▼</span>
                            </div>
                            <div class="tool-section-content">
                                <div class="export-options">
                                    <button class="btn btn-success" id="downloadPngBtn">
                                        Download PNG
                                    </button>
                                    <button class="btn btn-success" id="downloadJpgBtn">
                                        Download JPG
                                    </button>
                                </div>
                                
                                <div class="btn-group" style="margin-top: 15px;">
                                    <button class="btn btn-outline" id="undoBtn" data-tooltip="Undo last action">
                                        ↶ Undo
                                    </button>
                                    <button class="btn btn-outline" id="redoBtn" data-tooltip="Redo last action">
                                        ↷ Redo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Canvas Area -->
                <div class="canvas-area">
                    <div class="canvas-toolbar">
                        <div class="canvas-controls">
                            <button class="btn btn-primary" id="newMemeBtn">
                                🆕 New Meme
                            </button>
                            <button class="btn btn-secondary" id="resetCanvasBtn">
                                🔄 Reset
                            </button>
                        </div>
                        
                        <div class="canvas-controls">
                            <button class="btn btn-outline tooltip" id="helpBtn" data-tooltip="Click to add text, drag to move, double-click to edit">
                                ❓ Help
                            </button>
                        </div>
                    </div>
                    
                    <div class="canvas-container">
                        <div class="canvas-wrapper">
                            <canvas class="meme-canvas" id="memeCanvas" width="800" height="600"></canvas>
                            <div class="text-overlay" id="textOverlay"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Template Selection Modal -->
                <div class="modal" id="templateModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">Choose a Meme Template</h2>
                            <button class="close-btn" id="closeModalBtn">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="loading" id="templatesLoading">
                                <div class="spinner"></div>
                                <span>Loading templates...</span>
                            </div>
                            <div class="template-grid" id="templateGrid"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this._shadow.appendChild(this._root);
        this._initializeCanvas();
        this._setupEventListeners();
    }

    static get observedAttributes() {
        return ['templates-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'templates-data') {
            try {
                this._templatesData = JSON.parse(newValue);
                this._populateTemplates();
            } catch (e) {
                console.error("Error parsing templates data:", e);
            }
        }
    }

    _initializeCanvas() {
        this._canvas = this._shadow.getElementById('memeCanvas');
        this._ctx = this._canvas.getContext('2d');
        this._textOverlay = this._shadow.getElementById('textOverlay');
        
        // Set initial canvas size
        this._canvas.width = 800;
        this._canvas.height = 600;
        
        // Fill with white background initially
        this._ctx.fillStyle = '#ffffff';
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        
        this._saveState();
    }

    _setupEventListeners() {
        // Template selection
        const selectTemplateBtn = this._shadow.getElementById('selectTemplateBtn');
        const templateModal = this._shadow.getElementById('templateModal');
        const closeModalBtn = this._shadow.getElementById('closeModalBtn');
        
        selectTemplateBtn.addEventListener('click', () => {
            templateModal.classList.add('show');
        });
        
        closeModalBtn.addEventListener('click', () => {
            templateModal.classList.remove('show');
        });
        
        templateModal.addEventListener('click', (e) => {
            if (e.target === templateModal) {
                templateModal.classList.remove('show');
            }
        });
        
        // Image upload
        const uploadImageBtn = this._shadow.getElementById('uploadImageBtn');
        const imageUpload = this._shadow.getElementById('imageUpload');
        
        uploadImageBtn.addEventListener('click', () => {
            imageUpload.click();
        });
        
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this._loadCustomImage(e.target.files[0]);
            }
        });
        
        // Text controls
        const textContent = this._shadow.getElementById('textContent');
        const addTextBtn = this._shadow.getElementById('addTextBtn');
        const updateTextBtn = this._shadow.getElementById('updateTextBtn');
        
        addTextBtn.addEventListener('click', () => {
            const text = textContent.value.trim();
            if (text) {
                this._addTextLayer(text);
                textContent.value = '';
            }
        });
        
        updateTextBtn.addEventListener('click', () => {
            if (this._selectedLayer) {
                this._updateSelectedLayer();
            }
        });
        
        // Font controls
        this._setupFontControls();
        
        // Filter controls
        this._setupFilterControls();
        
        // Canvas interactions
        this._setupCanvasInteractions();
        
        // Tool section toggles
        this._setupToolSectionToggles();
        
        // Export buttons
        this._setupExportButtons();
        
        // History buttons
        const undoBtn = this._shadow.getElementById('undoBtn');
        const redoBtn = this._shadow.getElementById('redoBtn');
        
        undoBtn.addEventListener('click', () => this._undo());
        redoBtn.addEventListener('click', () => this._redo());
        
        // New meme and reset
        const newMemeBtn = this._shadow.getElementById('newMemeBtn');
        const resetCanvasBtn = this._shadow.getElementById('resetCanvasBtn');
        
        newMemeBtn.addEventListener('click', () => {
            this._shadow.getElementById('templateModal').classList.add('show');
        });
        
        resetCanvasBtn.addEventListener('click', () => {
            this._resetCanvas();
        });
    }

    _setupFontControls() {
        const fontFamily = this._shadow.getElementById('fontFamily');
        const fontSize = this._shadow.getElementById('fontSize');
        const fontSizeValue = this._shadow.getElementById('fontSizeValue');
        const textColor = this._shadow.getElementById('textColor');
        const strokeColor = this._shadow.getElementById('strokeColor');
        const strokeWidth = this._shadow.getElementById('strokeWidth');
        const strokeWidthValue = this._shadow.getElementById('strokeWidthValue');
        
        fontSize.addEventListener('input', (e) => {
            fontSizeValue.textContent = e.target.value;
            if (this._selectedLayer) {
                this._updateSelectedLayer();
            }
        });
        
        strokeWidth.addEventListener('input', (e) => {
            strokeWidthValue.textContent = e.target.value;
            if (this._selectedLayer) {
                this._updateSelectedLayer();
            }
        });
        
        [fontFamily, textColor, strokeColor].forEach(control => {
            control.addEventListener('change', () => {
                if (this._selectedLayer) {
                    this._updateSelectedLayer();
                }
            });
        });
    }

    _setupFilterControls() {
        const filterControls = [
            'brightness', 'contrast', 'saturate', 
            'sepia', 'grayscale'
        ];
        
        filterControls.forEach(filter => {
            const control = this._shadow.getElementById(filter);
            const valueDisplay = this._shadow.getElementById(filter + 'Value');
            
            control.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                this._filters[filter] = parseInt(value);
                this._applyFilters();
            });
        });
        
        const resetFiltersBtn = this._shadow.getElementById('resetFiltersBtn');
        resetFiltersBtn.addEventListener('click', () => {
            this._resetFilters();
        });
    }

    _setupCanvasInteractions() {
        // Canvas click to add text
        this._canvas.addEventListener('click', (e) => {
            if (!this._isDragging) {
                const rect = this._canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (this._canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (this._canvas.height / rect.height);
                
                // Deselect current layer
                this._selectLayer(null);
                
                // Add text at click position
                const textContent = this._shadow.getElementById('textContent');
                const text = textContent.value.trim() || 'Click to edit';
                this._addTextLayer(text, x, y);
                textContent.value = '';
            }
        });
        
        // Text layer interactions
        this._textOverlay.addEventListener('mousedown', this._handleTextMouseDown.bind(this));
        this._textOverlay.addEventListener('mousemove', this._handleTextMouseMove.bind(this));
        this._textOverlay.addEventListener('mouseup', this._handleTextMouseUp.bind(this));
        this._textOverlay.addEventListener('dblclick', this._handleTextDoubleClick.bind(this));
    }

    _setupToolSectionToggles() {
        const sectionHeaders = this._shadow.querySelectorAll('.tool-section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('collapsed');
            });
        });
    }

    _setupExportButtons() {
        const downloadPngBtn = this._shadow.getElementById('downloadPngBtn');
        const downloadJpgBtn = this._shadow.getElementById('downloadJpgBtn');
        
        downloadPngBtn.addEventListener('click', () => {
            this._exportMeme('png');
        });
        
        downloadJpgBtn.addEventListener('click', () => {
            this._exportMeme('jpeg');
        });
    }

    _populateTemplates() {
        const templateGrid = this._shadow.getElementById('templateGrid');
        const loading = this._shadow.getElementById('templatesLoading');
        
        if (!this._templatesData || !Array.isArray(this._templatesData)) {
            loading.innerHTML = '<p style="text-align: center; color: #666;">No templates available</p>';
            return;
        }
        
        loading.style.display = 'none';
        templateGrid.innerHTML = '';
        
        this._templatesData.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.innerHTML = `
                <img class="template-image" src="${template.image}" alt="${template.name}" loading="lazy">
                <div class="template-info">
                    <h3 class="template-name">${template.name}</h3>
                </div>
            `;
            
            templateItem.addEventListener('click', () => {
                this._loadTemplate(template);
                this._shadow.getElementById('templateModal').classList.remove('show');
            });
            
            templateGrid.appendChild(templateItem);
        });
    }

    _loadTemplate(template) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Resize canvas to match image aspect ratio
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            this._canvas.width = width;
            this._canvas.height = height;
            
            // Draw the template
            this._ctx.clearRect(0, 0, width, height);
            this._ctx.drawImage(img, 0, 0, width, height);
            
            this._currentTemplate = template;
            this._clearTextLayers();
            this._saveState();
            this._renderCanvas();
        };
        
        img.onerror = () => {
            console.error('Failed to load template image');
            alert('Failed to load template. Please try another one.');
        };
        
        img.src = template.image;
    }

    _loadCustomImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize canvas to match image aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                this._canvas.width = width;
                this._canvas.height = height;
                
                // Draw the custom image
                this._ctx.clearRect(0, 0, width, height);
                this._ctx.drawImage(img, 0, 0, width, height);
                
                this._currentTemplate = { name: 'Custom Upload', image: e.target.result };
                this._clearTextLayers();
                this._saveState();
                this._renderCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    _addTextLayer(text, x, y) {
        const layer = {
            id: Date.now(),
            text: text,
            x: x || this._canvas.width / 2,
            y: y || this._canvas.height / 4,
            fontSize: parseInt(this._shadow.getElementById('fontSize').value),
            fontFamily: this._shadow.getElementById('fontFamily').value,
            color: this._shadow.getElementById('textColor').value,
            strokeColor: this._shadow.getElementById('strokeColor').value,
            strokeWidth: parseInt(this._shadow.getElementById('strokeWidth').value),
            rotation: 0,
            width: 200,
            height: 50
        };
        
        this._textLayers.push(layer);
        this._selectLayer(layer);
        this._renderTextLayers();
        this._updateTextLayersList();
        this._saveState();
        this._renderCanvas();
    }

    _updateSelectedLayer() {
        if (!this._selectedLayer) return;
        
        const textContent = this._shadow.getElementById('textContent');
        if (textContent.value.trim()) {
            this._selectedLayer.text = textContent.value.trim();
        }
        
        this._selectedLayer.fontSize = parseInt(this._shadow.getElementById('fontSize').value);
        this._selectedLayer.fontFamily = this._shadow.getElementById('fontFamily').value;
        this._selectedLayer.color = this._shadow.getElementById('textColor').value;
        this._selectedLayer.strokeColor = this._shadow.getElementById('strokeColor').value;
        this._selectedLayer.strokeWidth = parseInt(this._shadow.getElementById('strokeWidth').value);
        
        this._renderTextLayers();
        this._updateTextLayersList();
        this._saveState();
        this._renderCanvas();
    }

    _selectLayer(layer) {
        // Remove selection from all layers
        this._shadow.querySelectorAll('.text-layer').forEach(el => {
            el.classList.remove('selected');
        });
        
        this._selectedLayer = layer;
        
        if (layer) {
            // Highlight selected layer
            const layerElement = this._shadow.querySelector(`[data-layer-id="${layer.id}"]`);
            if (layerElement) {
                layerElement.classList.add('selected');
            }
            
            // Update form controls
            this._shadow.getElementById('textContent').value = layer.text;
            this._shadow.getElementById('fontSize').value = layer.fontSize;
            this._shadow.getElementById('fontSizeValue').textContent = layer.fontSize;
            this._shadow.getElementById('fontFamily').value = layer.fontFamily;
            this._shadow.getElementById('textColor').value = layer.color;
            this._shadow.getElementById('strokeColor').value = layer.strokeColor;
            this._shadow.getElementById('strokeWidth').value = layer.strokeWidth;
            this._shadow.getElementById('strokeWidthValue').textContent = layer.strokeWidth;
        }
    }

    _deleteLayer(layerId) {
        this._textLayers = this._textLayers.filter(layer => layer.id !== layerId);
        
        if (this._selectedLayer && this._selectedLayer.id === layerId) {
            this._selectedLayer = null;
        }
        
        this._renderTextLayers();
        this._updateTextLayersList();
        this._saveState();
        this._renderCanvas();
    }

    _renderTextLayers() {
        this._textOverlay.innerHTML = '';
        
        this._textLayers.forEach(layer => {
            const layerElement = document.createElement('div');
            layerElement.className = 'text-layer';
            layerElement.setAttribute('data-layer-id', layer.id);
            layerElement.style.left = `${(layer.x / this._canvas.width) * 100}%`;
            layerElement.style.top = `${(layer.y / this._canvas.height) * 100}%`;
            layerElement.style.transform = `translate(-50%, -50%) rotate(${layer.rotation}deg)`;
            
            const textContent = document.createElement('div');
            textContent.className = 'text-content';
            textContent.style.fontSize = `${(layer.fontSize / this._canvas.width) * 100}vw`;
            textContent.style.fontFamily = layer.fontFamily;
            textContent.style.color = layer.color;
            textContent.style.webkitTextStroke = `${layer.strokeWidth}px ${layer.strokeColor}`;
            textContent.style.textStroke = `${layer.strokeWidth}px ${layer.strokeColor}`;
            textContent.textContent = layer.text;
            
            layerElement.appendChild(textContent);
            this._textOverlay.appendChild(layerElement);
        });
    }

    _updateTextLayersList() {
        const textLayersContainer = this._shadow.getElementById('textLayers');
        
        if (this._textLayers.length === 0) {
            textLayersContainer.innerHTML = `
                <p style="color: #666; font-size: 0.9rem; text-align: center; padding: 20px;">
                    No text layers yet. Add some text to get started!
                </p>
            `;
            return;
        }
        
        textLayersContainer.innerHTML = '';
        
        this._textLayers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'text-layer-item';
            if (this._selectedLayer && this._selectedLayer.id === layer.id) {
                layerItem.classList.add('active');
            }
            
            layerItem.innerHTML = `
                <div class="text-layer-preview">${layer.text}</div>
                <div class="text-layer-actions">
                    <button class="action-btn" title="Delete layer">🗑️</button>
                </div>
            `;
            
            layerItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn')) {
                    this._selectLayer(layer);
                    this._renderTextLayers();
                    this._updateTextLayersList();
                }
            });
            
            const deleteBtn = layerItem.querySelector('.action-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._deleteLayer(layer.id);
            });
            
            textLayersContainer.appendChild(layerItem);
        });
    }

    _handleTextMouseDown(e) {
        const layerElement = e.target.closest('.text-layer');
        if (!layerElement) return;
        
        const layerId = parseInt(layerElement.dataset.layerId);
        const layer = this._textLayers.find(l => l.id === layerId);
        
        if (layer) {
            this._selectLayer(layer);
            this._renderTextLayers();
            this._updateTextLayersList();
            
            this._isDragging = true;
            const rect = this._textOverlay.getBoundingClientRect();
            this._dragOffset = {
                x: e.clientX - rect.left - (layer.x / this._canvas.width * rect.width),
                y: e.clientY - rect.top - (layer.y / this._canvas.height * rect.height)
            };
        }
        
        e.preventDefault();
    }

    _handleTextMouseMove(e) {
        if (!this._isDragging || !this._selectedLayer) return;
        
        const rect = this._textOverlay.getBoundingClientRect();
        const x = ((e.clientX - rect.left - this._dragOffset.x) / rect.width) * this._canvas.width;
        const y = ((e.clientY - rect.top - this._dragOffset.y) / rect.height) * this._canvas.height;
        
        // Constrain to canvas bounds
        this._selectedLayer.x = Math.max(0, Math.min(this._canvas.width, x));
        this._selectedLayer.y = Math.max(0, Math.min(this._canvas.height, y));
        
        this._renderTextLayers();
        this._renderCanvas();
    }

    _handleTextMouseUp(e) {
        if (this._isDragging) {
            this._isDragging = false;
            this._saveState();
        }
    }

    _handleTextDoubleClick(e) {
        const layerElement = e.target.closest('.text-layer');
        if (!layerElement) return;
        
        const layerId = parseInt(layerElement.dataset.layerId);
        const layer = this._textLayers.find(l => l.id === layerId);
        
        if (layer) {
            this._selectLayer(layer);
            this._renderTextLayers();
            this._updateTextLayersList();
            
            // Focus on text input
            const textContent = this._shadow.getElementById('textContent');
            textContent.focus();
            textContent.select();
        }
    }

    _applyFilters() {
        if (!this._currentTemplate) return;
        
        this._renderCanvas();
    }

    _resetFilters() {
        this._filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            sepia: 0,
            grayscale: 0,
            blur: 0
        };
        
        // Update UI controls
        Object.keys(this._filters).forEach(filter => {
            const control = this._shadow.getElementById(filter);
            const valueDisplay = this._shadow.getElementById(filter + 'Value');
            if (control) {
                control.value = this._filters[filter];
                if (valueDisplay) {
                    valueDisplay.textContent = this._filters[filter];
                }
            }
        });
        
        this._renderCanvas();
    }

    _renderCanvas() {
        if (!this._currentTemplate) return;
        
        // Clear canvas
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        
        // Apply filters to canvas
        const filterString = `
            brightness(${this._filters.brightness}%)
            contrast(${this._filters.contrast}%)
            saturate(${this._filters.saturate}%)
            sepia(${this._filters.sepia}%)
            grayscale(${this._filters.grayscale}%)
        `.trim();
        
        this._ctx.filter = filterString;
        
        // Draw template image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this._ctx.drawImage(img, 0, 0, this._canvas.width, this._canvas.height);
            this._ctx.filter = 'none';
            
            // Draw text layers
            this._textLayers.forEach(layer => {
                this._drawTextLayer(layer);
            });
        };
        img.src = this._currentTemplate.image;
    }

    _drawTextLayer(layer) {
        this._ctx.save();
        
        // Set font properties
        this._ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'middle';
        
        // Apply transforms
        this._ctx.translate(layer.x, layer.y);
        this._ctx.rotate((layer.rotation * Math.PI) / 180);
        
        // Draw text stroke
        if (layer.strokeWidth > 0) {
            this._ctx.strokeStyle = layer.strokeColor;
            this._ctx.lineWidth = layer.strokeWidth;
            this._ctx.lineJoin = 'round';
            this._ctx.miterLimit = 2;
            this._ctx.strokeText(layer.text, 0, 0);
        }
        
        // Draw text fill
        this._ctx.fillStyle = layer.color;
        this._ctx.fillText(layer.text, 0, 0);
        
        this._ctx.restore();
    }

    _exportMeme(format) {
        if (!this._currentTemplate) {
            alert('Please select a template first!');
            return;
        }
        
        // Create a temporary canvas for export
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        exportCanvas.width = this._canvas.width;
        exportCanvas.height = this._canvas.height;
        
        // Draw the current canvas content
        exportCtx.drawImage(this._canvas, 0, 0);
        
        // Convert to blob and download
        exportCanvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `meme_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(link.href);
        }, format === 'jpeg' ? 'image/jpeg' : 'image/png');
    }

    _saveState() {
        const state = {
            template: this._currentTemplate,
            textLayers: JSON.parse(JSON.stringify(this._textLayers)),
            filters: { ...this._filters }
        };
        
        // Remove future history
        this._history = this._history.slice(0, this._historyIndex + 1);
        
        // Add current state
        this._history.push(state);
        this._historyIndex = this._history.length - 1;
        
        // Limit history size
        if (this._history.length > 20) {
            this._history.shift();
            this._historyIndex--;
        }
    }

    _undo() {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._restoreState(this._history[this._historyIndex]);
        }
    }

    _redo() {
        if (this._historyIndex < this._history.length - 1) {
            this._historyIndex++;
            this._restoreState(this._history[this._historyIndex]);
        }
    }

    _restoreState(state) {
        this._currentTemplate = state.template;
        this._textLayers = JSON.parse(JSON.stringify(state.textLayers));
        this._filters = { ...state.filters };
        
        // Update UI
        this._selectLayer(null);
        this._renderTextLayers();
        this._updateTextLayersList();
        this._renderCanvas();
        
        // Update filter controls
        Object.keys(this._filters).forEach(filter => {
            const control = this._shadow.getElementById(filter);
            const valueDisplay = this._shadow.getElementById(filter + 'Value');
            if (control) {
                control.value = this._filters[filter];
                if (valueDisplay) {
                    valueDisplay.textContent = this._filters[filter];
                }
            }
        });
    }

    _clearTextLayers() {
        this._textLayers = [];
        this._selectedLayer = null;
        this._renderTextLayers();
        this._updateTextLayersList();
    }

    _resetCanvas() {
        if (confirm('Are you sure you want to reset the canvas? This will clear all text layers.')) {
            this._clearTextLayers();
            this._resetFilters();
            
            if (this._currentTemplate) {
                this._renderCanvas();
            } else {
                this._ctx.fillStyle = '#ffffff';
                this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
            }
            
            this._saveState();
        }
    }

    // Public API methods
    setTemplate(template) {
        this._loadTemplate(template);
    }

    addText(text, x, y) {
        this._addTextLayer(text, x, y);
    }

    exportAs(format) {
        this._exportMeme(format);
    }

    reset() {
        this._resetCanvas();
    }
}

// Register the custom element
window.customElements.define('meme-generator', MemeGenerator);
