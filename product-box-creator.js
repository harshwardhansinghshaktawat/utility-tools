// File name: product-box-creator.js
// Custom element tag: <product-box-creator></product-box-creator>

class ProductBoxCreator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.box = null;
        
        // Textures and materials
        this.textures = {
            front: null,
            back: null,
            top: null,
            bottom: null,
            left: null,
            right: null
        };
        
        // Fixed software package dimensions (like the image reference)
        this.boxDimensions = {
            width: 1.4,  // Standard software package width
            height: 2.0, // Standard software package height
            depth: 0.3   // Thin depth like software packages
        };
        
        // Settings
        this.settings = {
            backgroundColor: '#f0f0f0',
            backgroundType: 'color', // 'color', 'gradient', 'image', 'transparent'
            backgroundImage: null,
            gradientStart: '#f0f0f0',
            gradientEnd: '#e0e0e0',
            gradientDirection: 'to bottom',
            exportResolution: 2048
        };
    }

    connectedCallback() {
        this.render();
        this.initThreeJS();
        this.setupEventListeners();
        this.updateBackgroundControls();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100vh;
                    font-family: Arial, sans-serif;
                }
                
                .container {
                    display: flex;
                    height: 100%;
                }
                
                .control-panel {
                    width: 320px;
                    padding: 20px;
                    background: #2c3e50;
                    color: white;
                    overflow-y: auto;
                    box-sizing: border-box;
                }
                
                .canvas-container {
                    flex: 1;
                    position: relative;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="10" height="10" fill="%23ffffff"/><rect x="10" y="10" width="10" height="10" fill="%23ffffff"/><rect x="10" y="0" width="10" height="10" fill="%23f0f0f0"/><rect x="0" y="10" width="10" height="10" fill="%23f0f0f0"/></svg>') repeat;
                }
                
                #canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
                
                .control-section {
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #34495e;
                }
                
                .control-section h3 {
                    margin: 0 0 15px 0;
                    color: #ecf0f1;
                    font-size: 16px;
                }
                
                .file-input-wrapper {
                    position: relative;
                    margin-bottom: 15px;
                }
                
                .file-input {
                    display: none;
                }
                
                .file-button {
                    display: block;
                    width: 100%;
                    padding: 12px 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 13px;
                    transition: background 0.3s;
                    line-height: 1.3;
                }
                
                .file-button:hover {
                    background: #2980b9;
                }
                
                .file-button.has-image {
                    background: #27ae60;
                }
                
                .dimension-hint {
                    font-size: 11px;
                    color: #95a5a6;
                    margin-top: 5px;
                    font-style: italic;
                    line-height: 1.2;
                }
                
                .control-group {
                    margin-bottom: 15px;
                }
                
                .control-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 12px;
                    color: #bdc3c7;
                }
                
                .control-group input[type="range"] {
                    width: 100%;
                    margin-bottom: 5px;
                }
                
                .control-group input[type="color"] {
                    width: 100%;
                    height: 40px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                
                .control-group select {
                    width: 100%;
                    padding: 8px;
                    border: none;
                    border-radius: 5px;
                    background: #34495e;
                    color: white;
                    font-size: 14px;
                }
                
                .export-section {
                    margin-top: 20px;
                }
                
                .export-button {
                    width: 100%;
                    padding: 15px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    transition: background 0.3s;
                }
                
                .export-button:hover {
                    background: #c0392b;
                }
                
                .value-display {
                    font-size: 12px;
                    color: #95a5a6;
                    text-align: right;
                }
                
                .reset-button {
                    width: 100%;
                    padding: 10px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 10px;
                }
                
                .reset-button:hover {
                    background: #7f8c8d;
                }
                
                .background-controls {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #34495e;
                }
                
                .package-info {
                    background: #34495e;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .package-info strong {
                    color: #3498db;
                }
            </style>
            
            <div class="container">
                <div class="control-panel">
                    <div class="control-section">
                        <h3>📦 Software Package Creator</h3>
                        <div class="package-info">
                            <strong>Fixed Dimensions:</strong> Professional software package proportions (1.4 × 2.0 × 0.3 ratio) like Adobe, Microsoft products.
                        </div>
                    </div>
                
                    <div class="control-section">
                        <h3>📁 Upload Images</h3>
                        <div class="file-input-wrapper">
                            <input type="file" id="front" class="file-input" accept="image/*">
                            <button class="file-button" data-face="front">📄 Front Face</button>
                            <div class="dimension-hint">Recommended: 1400×2000px (main product face)</div>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="back" class="file-input" accept="image/*">
                            <button class="file-button" data-face="back">📄 Back Face</button>
                            <div class="dimension-hint">Recommended: 1400×2000px (product info/features)</div>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="top" class="file-input" accept="image/*">
                            <button class="file-button" data-face="top">📄 Top Face</button>
                            <div class="dimension-hint">Recommended: 1400×300px (thin top edge)</div>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="bottom" class="file-input" accept="image/*">
                            <button class="file-button" data-face="bottom">📄 Bottom Face</button>
                            <div class="dimension-hint">Recommended: 1400×300px (thin bottom edge)</div>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="left" class="file-input" accept="image/*">
                            <button class="file-button" data-face="left">📄 Left Side</button>
                            <div class="dimension-hint">Recommended: 300×2000px (narrow side edge)</div>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="right" class="file-input" accept="image/*">
                            <button class="file-button" data-face="right">📄 Right Side</button>
                            <div class="dimension-hint">Recommended: 300×2000px (narrow side edge)</div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>🎨 Background</h3>
                        <div class="control-group">
                            <label>Background Type</label>
                            <select id="backgroundType">
                                <option value="color">Solid Color</option>
                                <option value="gradient">Gradient</option>
                                <option value="image">Image</option>
                                <option value="transparent">Transparent</option>
                            </select>
                        </div>
                        
                        <div class="background-controls" id="colorControls">
                            <div class="control-group">
                                <label>Color</label>
                                <input type="color" id="backgroundColor" value="#f0f0f0">
                            </div>
                        </div>
                        
                        <div class="background-controls" id="gradientControls" style="display: none;">
                            <div class="control-group">
                                <label>Start Color</label>
                                <input type="color" id="gradientStart" value="#f0f0f0">
                            </div>
                            <div class="control-group">
                                <label>End Color</label>
                                <input type="color" id="gradientEnd" value="#e0e0e0">
                            </div>
                            <div class="control-group">
                                <label>Direction</label>
                                <select id="gradientDirection">
                                    <option value="to bottom">Top to Bottom</option>
                                    <option value="to top">Bottom to Top</option>
                                    <option value="to right">Left to Right</option>
                                    <option value="to left">Right to Left</option>
                                    <option value="to bottom right">Diagonal ↘</option>
                                    <option value="to bottom left">Diagonal ↙</option>
                                    <option value="to top right">Diagonal ↗</option>
                                    <option value="to top left">Diagonal ↖</option>
                                    <option value="radial">Radial</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="background-controls" id="imageControls" style="display: none;">
                            <div class="file-input-wrapper">
                                <input type="file" id="backgroundImage" class="file-input" accept="image/*">
                                <button class="file-button" id="backgroundImageButton">🖼️ Upload Background Image</button>
                            </div>
                        </div>
                        
                        <div class="background-controls" id="transparentControls" style="display: none;">
                            <div class="package-info">
                                <strong>Transparent Background:</strong> Perfect for overlays, logos, and web graphics. Checkerboard pattern shows transparency.
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>🎥 Camera Controls</h3>
                        <div class="control-group">
                            <label>Rotation X</label>
                            <input type="range" id="rotationX" min="0" max="360" step="1" value="15">
                            <div class="value-display" id="rotationXValue">15°</div>
                        </div>
                        <div class="control-group">
                            <label>Rotation Y</label>
                            <input type="range" id="rotationY" min="0" max="360" step="1" value="45">
                            <div class="value-display" id="rotationYValue">45°</div>
                        </div>
                        <div class="control-group">
                            <label>Zoom</label>
                            <input type="range" id="zoom" min="2" max="10" step="0.1" value="4">
                            <div class="value-display" id="zoomValue">4.0</div>
                        </div>
                    </div>
                    
                    <div class="control-section export-section">
                        <h3>💾 Export Settings</h3>
                        <div class="control-group">
                            <label>Resolution</label>
                            <select id="exportResolution">
                                <option value="1024">1K (1024×1024)</option>
                                <option value="2048" selected>2K (2048×2048)</option>
                                <option value="4096">4K (4096×4096)</option>
                                <option value="8192">8K (8192×8192)</option>
                            </select>
                        </div>
                        <button class="export-button" id="exportPNG">📸 Export PNG</button>
                        <button class="export-button" id="exportJPG">📸 Export JPG</button>
                        <button class="reset-button" id="resetAll">🔄 Reset All</button>
                    </div>
                </div>
                
                <div class="canvas-container" id="canvasContainer">
                    <canvas id="canvas"></canvas>
                </div>
            </div>
        `;
    }

    async initThreeJS() {
        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            await this.loadThreeJS();
        }

        const canvas = this.shadowRoot.getElementById('canvas');
        const container = canvas.parentElement;

        // Scene
        this.scene = new THREE.Scene();

        // Camera - positioned to show software package properly
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(4, 2, 4);

        // Renderer with alpha for transparency
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true, 
            preserveDrawingBuffer: true, 
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set initial background
        this.updateBackground();

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Create software package box
        this.createSoftwareBox();

        // Start render loop
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    async loadThreeJS() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    createSoftwareBox() {
        // Remove existing box
        if (this.box) {
            this.scene.remove(this.box);
        }

        // Create geometry with software package dimensions
        const geometry = new THREE.BoxGeometry(
            this.boxDimensions.width,
            this.boxDimensions.height,
            this.boxDimensions.depth
        );

        // Create materials for each face
        const materials = [
            new THREE.MeshLambertMaterial({ color: 0xcccccc }), // right
            new THREE.MeshLambertMaterial({ color: 0xcccccc }), // left
            new THREE.MeshLambertMaterial({ color: 0xcccccc }), // top
            new THREE.MeshLambertMaterial({ color: 0xcccccc }), // bottom
            new THREE.MeshLambertMaterial({ color: 0xcccccc }), // front
            new THREE.MeshLambertMaterial({ color: 0xcccccc })  // back
        ];

        // Apply textures if available
        const faceMapping = ['right', 'left', 'top', 'bottom', 'front', 'back'];
        faceMapping.forEach((face, index) => {
            if (this.textures[face]) {
                materials[index].map = this.textures[face];
                materials[index].needsUpdate = true;
            }
        });

        this.box = new THREE.Mesh(geometry, materials);
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.scene.add(this.box);
    }

    updateBackground() {
        const container = this.shadowRoot.getElementById('canvasContainer');
        
        switch (this.settings.backgroundType) {
            case 'transparent':
                this.renderer.setClearColor(0x000000, 0);
                container.style.background = 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="10" height="10" fill="%23ffffff"/><rect x="10" y="10" width="10" height="10" fill="%23ffffff"/><rect x="10" y="0" width="10" height="10" fill="%23f0f0f0"/><rect x="0" y="10" width="10" height="10" fill="%23f0f0f0"/></svg>\') repeat';
                break;
                
            case 'color':
                this.renderer.setClearColor(this.settings.backgroundColor);
                container.style.background = '';
                break;
                
            case 'gradient':
                this.renderer.setClearColor(0x000000, 0);
                const direction = this.settings.gradientDirection === 'radial' 
                    ? 'radial-gradient(circle, ' 
                    : `linear-gradient(${this.settings.gradientDirection}, `;
                container.style.background = `${direction}${this.settings.gradientStart}, ${this.settings.gradientEnd})`;
                break;
                
            case 'image':
                if (this.settings.backgroundImage) {
                    this.renderer.setClearColor(0x000000, 0);
                    container.style.background = `url(${this.settings.backgroundImage}) center/cover no-repeat`;
                }
                break;
        }
    }

    updateCameraPosition() {
        const rotX = parseFloat(this.shadowRoot.getElementById('rotationX').value) * Math.PI / 180;
        const rotY = parseFloat(this.shadowRoot.getElementById('rotationY').value) * Math.PI / 180;
        const zoom = parseFloat(this.shadowRoot.getElementById('zoom').value);

        this.camera.position.x = zoom * Math.sin(rotY) * Math.cos(rotX);
        this.camera.position.y = zoom * Math.sin(rotX);
        this.camera.position.z = zoom * Math.cos(rotY) * Math.cos(rotX);
        
        this.camera.lookAt(0, 0, 0);
    }

    updateBackgroundControls() {
        const colorControls = this.shadowRoot.getElementById('colorControls');
        const gradientControls = this.shadowRoot.getElementById('gradientControls');
        const imageControls = this.shadowRoot.getElementById('imageControls');
        const transparentControls = this.shadowRoot.getElementById('transparentControls');

        // Hide all controls first
        [colorControls, gradientControls, imageControls, transparentControls].forEach(control => {
            control.style.display = 'none';
        });

        // Show relevant controls
        switch (this.settings.backgroundType) {
            case 'color':
                colorControls.style.display = 'block';
                break;
            case 'gradient':
                gradientControls.style.display = 'block';
                break;
            case 'image':
                imageControls.style.display = 'block';
                break;
            case 'transparent':
                transparentControls.style.display = 'block';
                break;
        }
    }

    setupEventListeners() {
        // File upload handlers
        const fileInputs = this.shadowRoot.querySelectorAll('.file-input');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFileUpload(e));
            
            if (input.id !== 'backgroundImage') {
                const button = this.shadowRoot.querySelector(`[data-face="${input.id}"]`);
                button.addEventListener('click', () => input.click());
            }
        });

        // Background type handler
        this.shadowRoot.getElementById('backgroundType').addEventListener('change', (e) => {
            this.settings.backgroundType = e.target.value;
            this.updateBackgroundControls();
            this.updateBackground();
        });

        // Background color handlers
        this.shadowRoot.getElementById('backgroundColor').addEventListener('input', (e) => {
            this.settings.backgroundColor = e.target.value;
            if (this.settings.backgroundType === 'color') {
                this.updateBackground();
            }
        });

        this.shadowRoot.getElementById('gradientStart').addEventListener('input', (e) => {
            this.settings.gradientStart = e.target.value;
            if (this.settings.backgroundType === 'gradient') {
                this.updateBackground();
            }
        });

        this.shadowRoot.getElementById('gradientEnd').addEventListener('input', (e) => {
            this.settings.gradientEnd = e.target.value;
            if (this.settings.backgroundType === 'gradient') {
                this.updateBackground();
            }
        });

        this.shadowRoot.getElementById('gradientDirection').addEventListener('change', (e) => {
            this.settings.gradientDirection = e.target.value;
            if (this.settings.backgroundType === 'gradient') {
                this.updateBackground();
            }
        });

        // Background image upload
        this.shadowRoot.getElementById('backgroundImage').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.settings.backgroundImage = event.target.result;
                    if (this.settings.backgroundType === 'image') {
                        this.updateBackground();
                    }
                    this.shadowRoot.getElementById('backgroundImageButton').textContent = '✅ Background Image Loaded';
                    this.shadowRoot.getElementById('backgroundImageButton').classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });

        this.shadowRoot.getElementById('backgroundImageButton').addEventListener('click', () => {
            this.shadowRoot.getElementById('backgroundImage').click();
        });

        // Camera control handlers
        ['rotationX', 'rotationY', 'zoom'].forEach(id => {
            const input = this.shadowRoot.getElementById(id);
            const valueDisplay = this.shadowRoot.getElementById(id + 'Value');
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (id === 'zoom') {
                    valueDisplay.textContent = value.toFixed(1);
                } else {
                    valueDisplay.textContent = value + '°';
                }
                this.updateCameraPosition();
            });
        });

        // Export handlers
        this.shadowRoot.getElementById('exportPNG').addEventListener('click', () => this.exportImage('png'));
        this.shadowRoot.getElementById('exportJPG').addEventListener('click', () => this.exportImage('jpg'));
        this.shadowRoot.getElementById('resetAll').addEventListener('click', () => this.resetAll());
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const face = event.target.id;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const texture = new THREE.Texture(img);
                texture.needsUpdate = true;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                
                this.textures[face] = texture;
                this.createSoftwareBox();
                
                // Update button appearance
                const button = this.shadowRoot.querySelector(`[data-face="${face}"]`);
                button.classList.add('has-image');
                button.textContent = `✅ ${face.charAt(0).toUpperCase() + face.slice(1)} Face`;
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    exportImage(format) {
        const resolution = parseInt(this.shadowRoot.getElementById('exportResolution').value);
        
        // Create temporary high-resolution canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = resolution;
        tempCanvas.height = resolution;
        
        // Handle background rendering first for non-transparent backgrounds
        if (this.settings.backgroundType !== 'transparent' && this.settings.backgroundType !== 'color') {
            const ctx = tempCanvas.getContext('2d');
            
            if (this.settings.backgroundType === 'gradient') {
                this.addGradientBackground(ctx, resolution);
            } else if (this.settings.backgroundType === 'image' && this.settings.backgroundImage) {
                this.addImageBackground(ctx, resolution);
            }
        }
        
        // Create temporary renderer
        const tempRenderer = new THREE.WebGLRenderer({ 
            canvas: tempCanvas, 
            antialias: true, 
            preserveDrawingBuffer: true,
            alpha: this.settings.backgroundType === 'transparent'
        });
        
        tempRenderer.setSize(resolution, resolution);
        tempRenderer.shadowMap.enabled = true;
        tempRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Set background based on type
        if (this.settings.backgroundType === 'transparent') {
            tempRenderer.setClearColor(0x000000, 0);
        } else if (this.settings.backgroundType === 'color') {
            tempRenderer.setClearColor(this.settings.backgroundColor);
        } else {
            tempRenderer.setClearColor(0x000000, 0);
        }

        // Update camera for square output
        const tempCamera = this.camera.clone();
        tempCamera.aspect = 1;
        tempCamera.updateProjectionMatrix();

        // Render 3D scene
        tempRenderer.render(this.scene, tempCamera);

        // Export
        const link = document.createElement('a');
        link.download = `software-package-${Date.now()}.${format}`;
        
        if (format === 'png') {
            link.href = tempCanvas.toDataURL('image/png');
        } else {
            link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        }
        
        link.click();

        // Cleanup
        tempRenderer.dispose();
    }

    addGradientBackground(ctx, resolution) {
        let gradient;
        
        if (this.settings.gradientDirection === 'radial') {
            gradient = ctx.createRadialGradient(resolution/2, resolution/2, 0, resolution/2, resolution/2, resolution/2);
        } else {
            const directions = {
                'to bottom': [0, 0, 0, resolution],
                'to top': [0, resolution, 0, 0],
                'to right': [0, 0, resolution, 0],
                'to left': [resolution, 0, 0, 0],
                'to bottom right': [0, 0, resolution, resolution],
                'to bottom left': [resolution, 0, 0, resolution],
                'to top right': [0, resolution, resolution, 0],
                'to top left': [resolution, resolution, 0, 0]
            };
            const coords = directions[this.settings.gradientDirection] || [0, 0, 0, resolution];
            gradient = ctx.createLinearGradient(...coords);
        }
        
        gradient.addColorStop(0, this.settings.gradientStart);
        gradient.addColorStop(1, this.settings.gradientEnd);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, resolution, resolution);
    }

    addImageBackground(ctx, resolution) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, resolution, resolution);
        };
        img.src = this.settings.backgroundImage;
    }

    resetAll() {
        // Reset textures
        Object.keys(this.textures).forEach(key => {
            this.textures[key] = null;
        });

        // Reset file inputs
        const fileInputs = this.shadowRoot.querySelectorAll('.file-input');
        fileInputs.forEach(input => {
            input.value = '';
            if (input.id === 'backgroundImage') {
                const button = this.shadowRoot.getElementById('backgroundImageButton');
                button.classList.remove('has-image');
                button.textContent = '🖼️ Upload Background Image';
            } else {
                const button = this.shadowRoot.querySelector(`[data-face="${input.id}"]`);
                button.classList.remove('has-image');
                button.textContent = `📄 ${input.id.charAt(0).toUpperCase() + input.id.slice(1)} Face`;
            }
        });

        // Reset controls
        this.shadowRoot.getElementById('backgroundType').value = 'color';
        this.shadowRoot.getElementById('backgroundColor').value = '#f0f0f0';
        this.shadowRoot.getElementById('gradientStart').value = '#f0f0f0';
        this.shadowRoot.getElementById('gradientEnd').value = '#e0e0e0';
        this.shadowRoot.getElementById('gradientDirection').value = 'to bottom';
        this.shadowRoot.getElementById('rotationX').value = '15';
        this.shadowRoot.getElementById('rotationY').value = '45';
        this.shadowRoot.getElementById('zoom').value = '4';

        // Reset settings
        this.settings = {
            backgroundColor: '#f0f0f0',
            backgroundType: 'color',
            backgroundImage: null,
            gradientStart: '#f0f0f0',
            gradientEnd: '#e0e0e0',
            gradientDirection: 'to bottom',
            exportResolution: 2048
        };

        // Update displays
        this.shadowRoot.getElementById('rotationXValue').textContent = '15°';
        this.shadowRoot.getElementById('rotationYValue').textContent = '45°';
        this.shadowRoot.getElementById('zoomValue').textContent = '4.0';

        // Update background controls and recreate box
        this.updateBackgroundControls();
        this.updateBackground();
        this.createSoftwareBox();
        this.updateCameraPosition();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const canvas = this.shadowRoot.getElementById('canvas');
        const container = canvas.parentElement;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// Register the custom element
customElements.define('product-box-creator', ProductBoxCreator);
