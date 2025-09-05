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
        this.shadowPlane = null;
        this.reflectionCube = null;
        
        // Lighting
        this.lights = {
            ambient: null,
            directional: null,
            point: null
        };
        
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
            exportResolution: 2048,
            
            // Advanced lighting
            ambientIntensity: 0.4,
            directionalIntensity: 0.8,
            pointIntensity: 0.3,
            shadowIntensity: 0.3,
            
            // Material properties
            materialType: 'satin', // 'matte', 'satin', 'glossy', 'metallic'
            roughness: 0.3,
            metalness: 0.0,
            
            // Effects
            enableShadows: true,
            enableReflections: false,
            reflectionIntensity: 0.1
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
                    width: 340px;
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
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #34495e;
                }
                
                .control-section h3 {
                    margin: 0 0 12px 0;
                    color: #ecf0f1;
                    font-size: 15px;
                }
                
                .file-input-wrapper {
                    position: relative;
                    margin-bottom: 12px;
                }
                
                .file-input {
                    display: none;
                }
                
                .file-button {
                    display: block;
                    width: 100%;
                    padding: 10px 8px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 12px;
                    transition: background 0.3s;
                    line-height: 1.2;
                }
                
                .file-button:hover {
                    background: #2980b9;
                }
                
                .file-button.has-image {
                    background: #27ae60;
                }
                
                .dimension-hint {
                    font-size: 10px;
                    color: #95a5a6;
                    margin-top: 3px;
                    font-style: italic;
                    line-height: 1.1;
                }
                
                .control-group {
                    margin-bottom: 12px;
                }
                
                .control-group label {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 11px;
                    color: #bdc3c7;
                }
                
                .control-group input[type="range"] {
                    width: 100%;
                    margin-bottom: 4px;
                }
                
                .control-group input[type="color"] {
                    width: 100%;
                    height: 35px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .control-group select {
                    width: 100%;
                    padding: 6px;
                    border: none;
                    border-radius: 4px;
                    background: #34495e;
                    color: white;
                    font-size: 12px;
                }
                
                .control-group input[type="checkbox"] {
                    margin-right: 8px;
                }
                
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    cursor: pointer;
                }
                
                .export-section {
                    margin-top: 15px;
                }
                
                .export-button {
                    width: 100%;
                    padding: 12px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 8px;
                    transition: background 0.3s;
                }
                
                .export-button:hover {
                    background: #c0392b;
                }
                
                .value-display {
                    font-size: 10px;
                    color: #95a5a6;
                    text-align: right;
                }
                
                .reset-button {
                    width: 100%;
                    padding: 8px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 8px;
                }
                
                .reset-button:hover {
                    background: #7f8c8d;
                }
                
                .background-controls {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #34495e;
                }
                
                .package-info {
                    background: #34495e;
                    padding: 8px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    font-size: 11px;
                    line-height: 1.3;
                }
                
                .package-info strong {
                    color: #3498db;
                }
                
                .two-column {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
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
                            <div class="two-column">
                                <div class="control-group">
                                    <label>Start Color</label>
                                    <input type="color" id="gradientStart" value="#f0f0f0">
                                </div>
                                <div class="control-group">
                                    <label>End Color</label>
                                    <input type="color" id="gradientEnd" value="#e0e0e0">
                                </div>
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
                        <h3>🎥 View Controls</h3>
                        <div class="control-group">
                            <label>Rotation X</label>
                            <input type="range" id="rotationX" min="-30" max="60" step="1" value="20">
                            <div class="value-display" id="rotationXValue">20°</div>
                        </div>
                        <div class="control-group">
                            <label>Rotation Y</label>
                            <input type="range" id="rotationY" min="-90" max="90" step="1" value="30">
                            <div class="value-display" id="rotationYValue">30°</div>
                        </div>
                        <div class="control-group">
                            <label>Distance</label>
                            <input type="range" id="zoom" min="3" max="8" step="0.1" value="4.5">
                            <div class="value-display" id="zoomValue">4.5</div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>💡 Lighting</h3>
                        <div class="control-group">
                            <label>Ambient Light</label>
                            <input type="range" id="ambientIntensity" min="0" max="1" step="0.05" value="0.4">
                            <div class="value-display" id="ambientValue">0.4</div>
                        </div>
                        <div class="control-group">
                            <label>Main Light</label>
                            <input type="range" id="directionalIntensity" min="0" max="2" step="0.1" value="0.8">
                            <div class="value-display" id="directionalValue">0.8</div>
                        </div>
                        <div class="control-group">
                            <label>Fill Light</label>
                            <input type="range" id="pointIntensity" min="0" max="1" step="0.05" value="0.3">
                            <div class="value-display" id="pointValue">0.3</div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>🎭 Material</h3>
                        <div class="control-group">
                            <label>Material Type</label>
                            <select id="materialType">
                                <option value="matte">Matte</option>
                                <option value="satin" selected>Satin</option>
                                <option value="glossy">Glossy</option>
                                <option value="metallic">Metallic</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Surface Roughness</label>
                            <input type="range" id="roughness" min="0" max="1" step="0.05" value="0.3">
                            <div class="value-display" id="roughnessValue">0.3</div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>✨ Effects</h3>
                        <div class="control-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableShadows" checked>
                                Enable Shadows
                            </label>
                        </div>
                        <div class="control-group">
                            <label>Shadow Intensity</label>
                            <input type="range" id="shadowIntensity" min="0" max="1" step="0.05" value="0.3">
                            <div class="value-display" id="shadowValue">0.3</div>
                        </div>
                        <div class="control-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableReflections">
                                Enable Floor Reflection
                            </label>
                        </div>
                        <div class="control-group">
                            <label>Reflection Intensity</label>
                            <input type="range" id="reflectionIntensity" min="0" max="0.5" step="0.02" value="0.1">
                            <div class="value-display" id="reflectionValue">0.1</div>
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
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        
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
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        
        // Set initial background
        this.updateBackground();

        // Setup lighting
        this.setupLighting();

        // Create shadow plane
        this.createShadowPlane();

        // Create software package box
        this.createSoftwareBox();

        // Set initial camera position
        this.updateCameraPosition();

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

    setupLighting() {
        // Remove existing lights
        if (this.lights.ambient) this.scene.remove(this.lights.ambient);
        if (this.lights.directional) this.scene.remove(this.lights.directional);
        if (this.lights.point) this.scene.remove(this.lights.point);

        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, this.settings.ambientIntensity);
        this.scene.add(this.lights.ambient);

        // Main directional light
        this.lights.directional = new THREE.DirectionalLight(0xffffff, this.settings.directionalIntensity);
        this.lights.directional.position.set(5, 8, 3);
        this.lights.directional.castShadow = this.settings.enableShadows;
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.lights.directional.shadow.camera.near = 0.1;
        this.lights.directional.shadow.camera.far = 50;
        this.lights.directional.shadow.camera.left = -10;
        this.lights.directional.shadow.camera.right = 10;
        this.lights.directional.shadow.camera.top = 10;
        this.lights.directional.shadow.camera.bottom = -10;
        this.scene.add(this.lights.directional);

        // Fill point light
        this.lights.point = new THREE.PointLight(0xffffff, this.settings.pointIntensity, 0, 2);
        this.lights.point.position.set(-3, 2, 4);
        this.scene.add(this.lights.point);
    }

    createShadowPlane() {
        if (this.shadowPlane) {
            this.scene.remove(this.shadowPlane);
        }

        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.ShadowMaterial({ 
            opacity: this.settings.shadowIntensity 
        });
        
        this.shadowPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.shadowPlane.rotation.x = -Math.PI / 2;
        this.shadowPlane.position.y = -this.boxDimensions.height / 2 - 0.01;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.visible = this.settings.enableShadows;
        this.scene.add(this.shadowPlane);
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

        // Create materials based on settings
        const materials = this.createMaterials();

        this.box = new THREE.Mesh(geometry, materials);
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        
        // Add reflection if enabled
        if (this.settings.enableReflections) {
            this.createReflection();
        }
        
        this.scene.add(this.box);
    }

    createMaterials() {
        const materials = [];
        
        // Material properties based on type
        const materialProps = this.getMaterialProperties();
        
        // Create materials for each face
        const faceMapping = ['right', 'left', 'top', 'bottom', 'front', 'back'];
        
        for (let i = 0; i < 6; i++) {
            const face = faceMapping[i];
            
            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: materialProps.roughness,
                metalness: materialProps.metalness,
                ...materialProps.extra
            });
            
            if (this.textures[face]) {
                material.map = this.textures[face];
            }
            
            materials.push(material);
        }
        
        return materials;
    }

    getMaterialProperties() {
        switch (this.settings.materialType) {
            case 'matte':
                return {
                    roughness: 0.8,
                    metalness: 0.0,
                    extra: {}
                };
            case 'satin':
                return {
                    roughness: this.settings.roughness,
                    metalness: 0.0,
                    extra: {}
                };
            case 'glossy':
                return {
                    roughness: 0.1,
                    metalness: 0.0,
                    extra: {}
                };
            case 'metallic':
                return {
                    roughness: this.settings.roughness,
                    metalness: 0.8,
                    extra: {}
                };
            default:
                return {
                    roughness: this.settings.roughness,
                    metalness: 0.0,
                    extra: {}
                };
        }
    }

    createReflection() {
        if (this.reflectionCube) {
            this.scene.remove(this.reflectionCube);
        }

        const geometry = new THREE.BoxGeometry(
            this.boxDimensions.width,
            this.boxDimensions.height,
            this.boxDimensions.depth
        );

        const materials = this.box.material.map(mat => {
            const reflMat = mat.clone();
            reflMat.transparent = true;
            reflMat.opacity = this.settings.reflectionIntensity;
            return reflMat;
        });

        this.reflectionCube = new THREE.Mesh(geometry, materials);
        this.reflectionCube.position.copy(this.box.position);
        this.reflectionCube.position.y = -this.boxDimensions.height - 0.02;
        this.reflectionCube.scale.y = -1;
        this.reflectionCube.visible = this.settings.enableReflections;
        
        this.scene.add(this.reflectionCube);
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
        const distance = parseFloat(this.shadowRoot.getElementById('zoom').value);

        // Improved camera positioning to maintain better perspective
        const x = distance * Math.sin(rotY) * Math.cos(rotX);
        const y = distance * Math.sin(rotX);
        const z = distance * Math.cos(rotY) * Math.cos(rotX);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    updateLighting() {
        this.lights.ambient.intensity = this.settings.ambientIntensity;
        this.lights.directional.intensity = this.settings.directionalIntensity;
        this.lights.point.intensity = this.settings.pointIntensity;
        
        this.lights.directional.castShadow = this.settings.enableShadows;
        if (this.shadowPlane) {
            this.shadowPlane.visible = this.settings.enableShadows;
            this.shadowPlane.material.opacity = this.settings.shadowIntensity;
        }
    }

    updateMaterial() {
        if (this.box && this.box.material) {
            const materialProps = this.getMaterialProperties();
            
            this.box.material.forEach(material => {
                material.roughness = materialProps.roughness;
                material.metalness = materialProps.metalness;
                material.needsUpdate = true;
            });
        }
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

        // Background handlers
        this.shadowRoot.getElementById('backgroundType').addEventListener('change', (e) => {
            this.settings.backgroundType = e.target.value;
            this.updateBackgroundControls();
            this.updateBackground();
        });

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

        // Lighting handlers
        ['ambientIntensity', 'directionalIntensity', 'pointIntensity', 'shadowIntensity'].forEach(id => {
            const input = this.shadowRoot.getElementById(id);
            const valueDisplay = this.shadowRoot.getElementById(id.replace('Intensity', 'Value'));
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.settings[id] = value;
                valueDisplay.textContent = value.toFixed(2);
                this.updateLighting();
            });
        });

        // Material handlers
        this.shadowRoot.getElementById('materialType').addEventListener('change', (e) => {
            this.settings.materialType = e.target.value;
            this.updateMaterial();
        });

        this.shadowRoot.getElementById('roughness').addEventListener('input', (e) => {
            this.settings.roughness = parseFloat(e.target.value);
            this.shadowRoot.getElementById('roughnessValue').textContent = this.settings.roughness.toFixed(2);
            this.updateMaterial();
        });

        // Effects handlers
        this.shadowRoot.getElementById('enableShadows').addEventListener('change', (e) => {
            this.settings.enableShadows = e.target.checked;
            this.updateLighting();
        });

        this.shadowRoot.getElementById('enableReflections').addEventListener('change', (e) => {
            this.settings.enableReflections = e.target.checked;
            if (this.settings.enableReflections) {
                this.createReflection();
            } else if (this.reflectionCube) {
                this.reflectionCube.visible = false;
            }
        });

        this.shadowRoot.getElementById('reflectionIntensity').addEventListener('input', (e) => {
            this.settings.reflectionIntensity = parseFloat(e.target.value);
            this.shadowRoot.getElementById('reflectionValue').textContent = this.settings.reflectionIntensity.toFixed(2);
            if (this.reflectionCube) {
                this.reflectionCube.material.forEach(mat => {
                    mat.opacity = this.settings.reflectionIntensity;
                });
            }
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
        tempRenderer.gammaOutput = true;
        tempRenderer.gammaFactor = 2.2;

        // Set background based on type
        if (this.settings.backgroundType === 'transparent') {
            tempRenderer.setClearColor(0x000000, 0);
        } else if (this.settings.backgroundType === 'color') {
            tempRenderer.setClearColor(this.settings.backgroundColor);
        } else {
            tempRenderer.setClearColor(0x000000, 0);
        }

        // Create export camera with closer framing
        const tempCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        
        // Position camera closer for better framing in export
        const distance = 3.2; // Closer distance for export
        const rotX = 20 * Math.PI / 180;
        const rotY = 30 * Math.PI / 180;
        
        tempCamera.position.x = distance * Math.sin(rotY) * Math.cos(rotX);
        tempCamera.position.y = distance * Math.sin(rotX);
        tempCamera.position.z = distance * Math.cos(rotY) * Math.cos(rotX);
        tempCamera.lookAt(0, 0, 0);

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

        // Reset all controls to default values
        this.shadowRoot.getElementById('backgroundType').value = 'color';
        this.shadowRoot.getElementById('backgroundColor').value = '#f0f0f0';
        this.shadowRoot.getElementById('gradientStart').value = '#f0f0f0';
        this.shadowRoot.getElementById('gradientEnd').value = '#e0e0e0';
        this.shadowRoot.getElementById('gradientDirection').value = 'to bottom';
        this.shadowRoot.getElementById('rotationX').value = '20';
        this.shadowRoot.getElementById('rotationY').value = '30';
        this.shadowRoot.getElementById('zoom').value = '4.5';
        this.shadowRoot.getElementById('ambientIntensity').value = '0.4';
        this.shadowRoot.getElementById('directionalIntensity').value = '0.8';
        this.shadowRoot.getElementById('pointIntensity').value = '0.3';
        this.shadowRoot.getElementById('shadowIntensity').value = '0.3';
        this.shadowRoot.getElementById('materialType').value = 'satin';
        this.shadowRoot.getElementById('roughness').value = '0.3';
        this.shadowRoot.getElementById('enableShadows').checked = true;
        this.shadowRoot.getElementById('enableReflections').checked = false;
        this.shadowRoot.getElementById('reflectionIntensity').value = '0.1';

        // Reset settings
        this.settings = {
            backgroundColor: '#f0f0f0',
            backgroundType: 'color',
            backgroundImage: null,
            gradientStart: '#f0f0f0',
            gradientEnd: '#e0e0e0',
            gradientDirection: 'to bottom',
            exportResolution: 2048,
            ambientIntensity: 0.4,
            directionalIntensity: 0.8,
            pointIntensity: 0.3,
            shadowIntensity: 0.3,
            materialType: 'satin',
            roughness: 0.3,
            metalness: 0.0,
            enableShadows: true,
            enableReflections: false,
            reflectionIntensity: 0.1
        };

        // Update all displays
        this.shadowRoot.getElementById('rotationXValue').textContent = '20°';
        this.shadowRoot.getElementById('rotationYValue').textContent = '30°';
        this.shadowRoot.getElementById('zoomValue').textContent = '4.5';
        this.shadowRoot.getElementById('ambientValue').textContent = '0.40';
        this.shadowRoot.getElementById('directionalValue').textContent = '0.80';
        this.shadowRoot.getElementById('pointValue').textContent = '0.30';
        this.shadowRoot.getElementById('shadowValue').textContent = '0.30';
        this.shadowRoot.getElementById('roughnessValue').textContent = '0.30';
        this.shadowRoot.getElementById('reflectionValue').textContent = '0.10';

        // Update all systems
        this.updateBackgroundControls();
        this.updateBackground();
        this.setupLighting();
        this.createShadowPlane();
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
