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
        this.controls = null;
        
        // Textures and materials
        this.textures = {
            front: null,
            back: null,
            top: null,
            bottom: null,
            left: null,
            right: null
        };
        
        // Settings
        this.settings = {
            backgroundColor: '#f0f0f0',
            boxSize: { width: 2, height: 2, depth: 2 },
            perspective: { x: 0, y: 0, z: 5 },
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
                    width: 300px;
                    padding: 20px;
                    background: #2c3e50;
                    color: white;
                    overflow-y: auto;
                    box-sizing: border-box;
                }
                
                .canvas-container {
                    flex: 1;
                    position: relative;
                    background: #34495e;
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
                    margin-bottom: 10px;
                }
                
                .file-input {
                    display: none;
                }
                
                .file-button {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 14px;
                    transition: background 0.3s;
                }
                
                .file-button:hover {
                    background: #2980b9;
                }
                
                .file-button.has-image {
                    background: #27ae60;
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
            </style>
            
            <div class="container">
                <div class="control-panel">
                    <div class="control-section">
                        <h3>📁 Upload Images</h3>
                        <div class="file-input-wrapper">
                            <input type="file" id="front" class="file-input" accept="image/*">
                            <button class="file-button" data-face="front">📄 Front Face</button>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="back" class="file-input" accept="image/*">
                            <button class="file-button" data-face="back">📄 Back Face</button>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="top" class="file-input" accept="image/*">
                            <button class="file-button" data-face="top">📄 Top Face</button>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="bottom" class="file-input" accept="image/*">
                            <button class="file-button" data-face="bottom">📄 Bottom Face</button>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="left" class="file-input" accept="image/*">
                            <button class="file-button" data-face="left">📄 Left Side</button>
                        </div>
                        <div class="file-input-wrapper">
                            <input type="file" id="right" class="file-input" accept="image/*">
                            <button class="file-button" data-face="right">📄 Right Side</button>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>🎨 Background</h3>
                        <div class="control-group">
                            <label>Background Color</label>
                            <input type="color" id="backgroundColor" value="#f0f0f0">
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>📦 Box Dimensions</h3>
                        <div class="control-group">
                            <label>Width</label>
                            <input type="range" id="boxWidth" min="0.5" max="4" step="0.1" value="2">
                            <div class="value-display" id="widthValue">2.0</div>
                        </div>
                        <div class="control-group">
                            <label>Height</label>
                            <input type="range" id="boxHeight" min="0.5" max="4" step="0.1" value="2">
                            <div class="value-display" id="heightValue">2.0</div>
                        </div>
                        <div class="control-group">
                            <label>Depth</label>
                            <input type="range" id="boxDepth" min="0.5" max="4" step="0.1" value="2">
                            <div class="value-display" id="depthValue">2.0</div>
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
                            <input type="range" id="zoom" min="2" max="10" step="0.1" value="5">
                            <div class="value-display" id="zoomValue">5.0</div>
                        </div>
                    </div>
                    
                    <div class="control-section export-section">
                        <h3>💾 Export Settings</h3>
                        <div class="control-group">
                            <label>Resolution</label>
                            <select id="exportResolution">
                                <option value="1024">1K (1024x1024)</option>
                                <option value="2048" selected>2K (2048x2048)</option>
                                <option value="4096">4K (4096x4096)</option>
                                <option value="8192">8K (8192x8192)</option>
                            </select>
                        </div>
                        <button class="export-button" id="exportPNG">📸 Export PNG</button>
                        <button class="export-button" id="exportJPG">📸 Export JPG</button>
                        <button class="reset-button" id="resetAll">🔄 Reset All</button>
                    </div>
                </div>
                
                <div class="canvas-container">
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

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(5, 3, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(this.settings.backgroundColor);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Create box
        this.createBox();

        // Controls
        this.setupOrbitControls();

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

    createBox() {
        // Remove existing box
        if (this.box) {
            this.scene.remove(this.box);
        }

        const geometry = new THREE.BoxGeometry(
            this.settings.boxSize.width,
            this.settings.boxSize.height,
            this.settings.boxSize.depth
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

    setupOrbitControls() {
        // Simple manual controls since OrbitControls might not be available
        this.updateCameraPosition();
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

    setupEventListeners() {
        // File upload handlers
        const fileInputs = this.shadowRoot.querySelectorAll('.file-input');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFileUpload(e));
            
            const button = this.shadowRoot.querySelector(`[data-face="${input.id}"]`);
            button.addEventListener('click', () => input.click());
        });

        // Control handlers
        this.shadowRoot.getElementById('backgroundColor').addEventListener('input', (e) => {
            this.settings.backgroundColor = e.target.value;
            this.renderer.setClearColor(this.settings.backgroundColor);
        });

        // Box dimension handlers
        ['boxWidth', 'boxHeight', 'boxDepth'].forEach(id => {
            const input = this.shadowRoot.getElementById(id);
            const valueDisplay = this.shadowRoot.getElementById(id.replace('box', '').toLowerCase() + 'Value');
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const dimension = id.replace('box', '').toLowerCase();
                this.settings.boxSize[dimension === 'width' ? 'width' : dimension === 'height' ? 'height' : 'depth'] = value;
                valueDisplay.textContent = value.toFixed(1);
                this.createBox();
            });
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
                this.createBox();
                
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
        
        // Create temporary high-resolution renderer
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = resolution;
        tempCanvas.height = resolution;
        
        const tempRenderer = new THREE.WebGLRenderer({ 
            canvas: tempCanvas, 
            antialias: true, 
            preserveDrawingBuffer: true 
        });
        
        tempRenderer.setSize(resolution, resolution);
        tempRenderer.setClearColor(this.settings.backgroundColor);
        tempRenderer.shadowMap.enabled = true;
        tempRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Update camera aspect ratio for square output
        const tempCamera = this.camera.clone();
        tempCamera.aspect = 1;
        tempCamera.updateProjectionMatrix();

        // Render at high resolution
        tempRenderer.render(this.scene, tempCamera);

        // Export
        const link = document.createElement('a');
        link.download = `product-box-${Date.now()}.${format}`;
        
        if (format === 'png') {
            link.href = tempCanvas.toDataURL('image/png');
        } else {
            link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        }
        
        link.click();

        // Cleanup
        tempRenderer.dispose();
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
            const button = this.shadowRoot.querySelector(`[data-face="${input.id}"]`);
            button.classList.remove('has-image');
            button.textContent = `📄 ${input.id.charAt(0).toUpperCase() + input.id.slice(1)} Face`;
        });

        // Reset controls
        this.shadowRoot.getElementById('backgroundColor').value = '#f0f0f0';
        this.shadowRoot.getElementById('boxWidth').value = '2';
        this.shadowRoot.getElementById('boxHeight').value = '2';
        this.shadowRoot.getElementById('boxDepth').value = '2';
        this.shadowRoot.getElementById('rotationX').value = '15';
        this.shadowRoot.getElementById('rotationY').value = '45';
        this.shadowRoot.getElementById('zoom').value = '5';

        // Reset settings
        this.settings = {
            backgroundColor: '#f0f0f0',
            boxSize: { width: 2, height: 2, depth: 2 },
            perspective: { x: 0, y: 0, z: 5 },
            exportResolution: 2048
        };

        // Update displays
        this.shadowRoot.getElementById('widthValue').textContent = '2.0';
        this.shadowRoot.getElementById('heightValue').textContent = '2.0';
        this.shadowRoot.getElementById('depthValue').textContent = '2.0';
        this.shadowRoot.getElementById('rotationXValue').textContent = '15°';
        this.shadowRoot.getElementById('rotationYValue').textContent = '45°';
        this.shadowRoot.getElementById('zoomValue').textContent = '5.0';

        // Recreate box and update scene
        this.renderer.setClearColor(this.settings.backgroundColor);
        this.createBox();
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
