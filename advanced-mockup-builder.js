class AdvancedMockupBuilder extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.softwareBox = null;
        this.directionalLight = null;
        this.ambientLight = null;
        this.floor = null;
        
        // Interaction state
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationX = 0.2; // Initial slight tilt
        this.rotationY = 0.3;
        
        // Textures storage
        this.textures = {
            front: null,
            back: null,
            left: null,
            right: null,
            top: null,
            bottom: null
        };
        
        // Default parameters
        this.defaultParams = {
            cameraDistance: 8,
            cameraFov: 50,
            dofIntensity: 0,
            focusDistance: 8,
            lightHBlur: 0.3,
            lightVBlur: 0.3,
            ambientIntensity: 0.4,
            shadowIntensity: 0.6
        };
        
        this.init();
    }

    init() {
        this.createStyles();
        this.createHTML();
        this.loadThreeJS().then(() => {
            this.setupThreeJS();
            this.createSoftwareBox();
            this.setupLighting();
            this.setupEventListeners();
            this.animate();
        });
    }

    async loadThreeJS() {
        return new Promise((resolve) => {
            if (window.THREE) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                height: 100vh;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                --primary-color: #64ffda;
                --secondary-color: #4fc3f7;
                --accent-color: #ff6b6b;
                --bg-dark: #1e1e2e;
                --bg-panel: rgba(30, 30, 46, 0.95);
                --text-primary: #ffffff;
                --text-secondary: #b8b8cc;
            }

            .mockup-builder {
                background: linear-gradient(135deg, var(--bg-dark) 0%, #2d2d3a 100%);
                color: var(--text-primary);
                height: 100%;
                display: flex;
                position: relative;
            }

            .controls-panel {
                width: 320px;
                background: var(--bg-panel);
                backdrop-filter: blur(10px);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                padding: 20px;
                overflow-y: auto;
                max-height: 100vh;
                box-sizing: border-box;
            }

            .viewport {
                flex: 1;
                position: relative;
                background: radial-gradient(circle at center, #2a2a3e 0%, #1a1a2e 100%);
            }

            #canvas-container {
                width: 100%;
                height: 100%;
                position: relative;
            }

            .control-section {
                margin-bottom: 25px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .section-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 15px;
                color: var(--primary-color);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .control-group {
                margin-bottom: 12px;
            }

            .control-label {
                display: block;
                font-size: 12px;
                margin-bottom: 6px;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .slider-container {
                position: relative;
                margin-bottom: 8px;
            }

            .slider {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.1);
                outline: none;
                -webkit-appearance: none;
                appearance: none;
                transition: all 0.2s ease;
            }

            .slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 8px rgba(100, 255, 218, 0.3);
                transition: all 0.2s ease;
            }

            .slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(100, 255, 218, 0.5);
            }

            .file-input-wrapper {
                position: relative;
                display: inline-block;
                width: 100%;
                margin-bottom: 8px;
            }

            .file-input {
                position: absolute;
                opacity: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }

            .file-input-label {
                display: block;
                padding: 8px 12px;
                background: linear-gradient(45deg, var(--secondary-color), #29b6f6);
                border-radius: 6px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                color: white;
            }

            .file-input-label:hover {
                background: linear-gradient(45deg, #29b6f6, #0288d1);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
            }

            .action-btn {
                width: 100%;
                padding: 10px;
                background: linear-gradient(45deg, var(--accent-color), #ee5a52);
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-bottom: 8px;
            }

            .action-btn:hover {
                background: linear-gradient(45deg, #ee5a52, #e53935);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
            }

            .action-btn.download {
                background: linear-gradient(45deg, #4caf50, #45a049);
            }

            .action-btn.download:hover {
                background: linear-gradient(45deg, #45a049, #388e3c);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }

            .value-display {
                position: absolute;
                right: 0;
                top: -20px;
                font-size: 10px;
                color: var(--primary-color);
                background: rgba(100, 255, 218, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 500;
            }

            .artwork-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 10px;
            }

            .artwork-face {
                text-align: center;
            }

            .face-label {
                font-size: 10px;
                margin-bottom: 4px;
                color: var(--text-secondary);
            }

            .loading-indicator {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(100, 255, 218, 0.9);
                color: var(--bg-dark);
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }

            .loading-indicator.show {
                opacity: 1;
            }

            canvas {
                display: block;
                outline: none;
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    createHTML() {
        const container = document.createElement('div');
        container.className = 'mockup-builder';
        container.innerHTML = `
            <div class="controls-panel">
                <div class="control-section">
                    <div class="section-title">🎨 Artwork</div>
                    <div class="artwork-grid">
                        <div class="artwork-face">
                            <div class="face-label">Front</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="front-artwork" accept="image/*">
                                <label for="front-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                        <div class="artwork-face">
                            <div class="face-label">Back</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="back-artwork" accept="image/*">
                                <label for="back-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                        <div class="artwork-face">
                            <div class="face-label">Left</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="left-artwork" accept="image/*">
                                <label for="left-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                        <div class="artwork-face">
                            <div class="face-label">Right</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="right-artwork" accept="image/*">
                                <label for="right-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                        <div class="artwork-face">
                            <div class="face-label">Top</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="top-artwork" accept="image/*">
                                <label for="top-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                        <div class="artwork-face">
                            <div class="face-label">Bottom</div>
                            <div class="file-input-wrapper">
                                <input type="file" class="file-input" id="bottom-artwork" accept="image/*">
                                <label for="bottom-artwork" class="file-input-label">Upload</label>
                            </div>
                        </div>
                    </div>
                    <button class="action-btn" id="reset-artwork-btn">Reset Artwork</button>
                </div>

                <div class="control-section">
                    <div class="section-title">📷 Camera</div>
                    <div class="control-group">
                        <label class="control-label">Distance</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="camera-distance" min="3" max="15" value="8" step="0.1">
                            <div class="value-display" id="camera-distance-value">8.0</div>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Perspective</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="camera-fov" min="20" max="100" value="50" step="1">
                            <div class="value-display" id="camera-fov-value">50°</div>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Depth of Field</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="dof-intensity" min="0" max="1" value="0" step="0.01">
                            <div class="value-display" id="dof-intensity-value">0.00</div>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Focus</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="focus-distance" min="1" max="20" value="8" step="0.1">
                            <div class="value-display" id="focus-distance-value">8.0</div>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="section-title">💡 Direct Lighting</div>
                    <div class="control-group">
                        <label class="control-label">Horizontal Blur</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="light-h-blur" min="0" max="2" value="0.3" step="0.01">
                            <div class="value-display" id="light-h-blur-value">0.30</div>
                        </div>
                    </div>
                    <div class="control-group">
                        <label class="control-label">Vertical Blur</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="light-v-blur" min="0" max="2" value="0.3" step="0.01">
                            <div class="value-display" id="light-v-blur-value">0.30</div>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="section-title">🌟 Object Lighting</div>
                    <div class="control-group">
                        <label class="control-label">Direct Ambient</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="ambient-intensity" min="0" max="2" value="0.4" step="0.01">
                            <div class="value-display" id="ambient-intensity-value">0.40</div>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="section-title">🌑 Floor Shadow</div>
                    <div class="control-group">
                        <label class="control-label">Direct Ambient</label>
                        <div class="slider-container">
                            <input type="range" class="slider" id="shadow-intensity" min="0" max="1" value="0.6" step="0.01">
                            <div class="value-display" id="shadow-intensity-value">0.60</div>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <button class="action-btn" id="reset-params-btn">Reset Parameters</button>
                    <button class="action-btn download" id="download-btn">📥 Download Image</button>
                </div>
            </div>

            <div class="viewport">
                <div id="canvas-container"></div>
                <div class="loading-indicator" id="loading">Rendering...</div>
            </div>
        `;
        this.shadowRoot.appendChild(container);
    }

    setupThreeJS() {
        const container = this.shadowRoot.getElementById('canvas-container');
        if (!container) return;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            this.defaultParams.cameraFov,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.updateCameraPosition();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            preserveDrawingBuffer: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        container.appendChild(this.renderer.domElement);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => this.handleResize());
        resizeObserver.observe(container);
    }

    createSoftwareBox() {
        // Create sophisticated software box geometry with rounded edges
        const width = 2.2;
        const height = 2.8;
        const depth = 0.3;
        
        // Create rounded box geometry
        const shape = new THREE.Shape();
        const radius = 0.05;
        
        shape.moveTo(-width/2 + radius, -height/2);
        shape.lineTo(width/2 - radius, -height/2);
        shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
        shape.lineTo(width/2, height/2 - radius);
        shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
        shape.lineTo(-width/2 + radius, height/2);
        shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
        shape.lineTo(-width/2, -height/2 + radius);
        shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

        const extrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 8,
            bevelSize: 0.02,
            bevelThickness: 0.02
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        // Create default material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.2,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            reflectivity: 0.8
        });

        // Create box - Position it ABOVE the floor, not intersecting
        this.softwareBox = new THREE.Mesh(geometry, material);
        this.softwareBox.castShadow = true;
        this.softwareBox.receiveShadow = true;
        this.softwareBox.position.y = depth / 2 + 0.1; // Lift it above the floor
        this.softwareBox.rotation.x = this.rotationX;
        this.softwareBox.rotation.y = this.rotationY;
        
        this.scene.add(this.softwareBox);

        // Create floor - positioned at y=0
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a3e,
            metalness: 0.8,
            roughness: 0.2,
            reflectivity: 0.9
        });
        
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = 0; // Floor at ground level
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
    }

    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x4fc3f7, this.defaultParams.ambientIntensity);
        this.scene.add(this.ambientLight);

        // Main directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(10, 10, 5);
        this.directionalLight.castShadow = true;
        
        // Shadow properties
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 50;
        this.directionalLight.shadow.camera.left = -10;
        this.directionalLight.shadow.camera.right = 10;
        this.directionalLight.shadow.camera.top = 10;
        this.directionalLight.shadow.camera.bottom = -10;
        this.directionalLight.shadow.radius = 5;
        this.directionalLight.shadow.blurSamples = 25;
        
        this.scene.add(this.directionalLight);

        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0x64ffda, 0.3);
        fillLight1.position.set(-5, 3, 5);
        this.scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xff6b6b, 0.2);
        fillLight2.position.set(3, -2, -5);
        this.scene.add(fillLight2);
    }

    updateCameraPosition() {
        const distance = this.defaultParams.cameraDistance;
        this.camera.position.set(
            Math.sin(0.3) * distance,
            4,
            Math.cos(0.3) * distance
        );
        this.camera.lookAt(0, 1, 0); // Look at the box center, not ground
    }

    setupEventListeners() {
        // Artwork upload handlers
        const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
        faces.forEach(face => {
            const input = this.shadowRoot.getElementById(`${face}-artwork`);
            if (input) {
                input.addEventListener('change', (e) => this.handleArtworkUpload(e, face));
            }
        });

        // Parameter sliders
        const sliders = [
            'camera-distance', 'camera-fov', 'dof-intensity', 'focus-distance',
            'light-h-blur', 'light-v-blur', 'ambient-intensity', 'shadow-intensity'
        ];

        sliders.forEach(sliderId => {
            const slider = this.shadowRoot.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => this.handleSliderChange(sliderId, e.target.value));
                // Initialize value display
                this.updateValueDisplay(sliderId, slider.value);
            }
        });

        // Action buttons
        const resetArtworkBtn = this.shadowRoot.getElementById('reset-artwork-btn');
        if (resetArtworkBtn) {
            resetArtworkBtn.addEventListener('click', () => this.resetArtwork());
        }

        const resetParamsBtn = this.shadowRoot.getElementById('reset-params-btn');
        if (resetParamsBtn) {
            resetParamsBtn.addEventListener('click', () => this.resetParameters());
        }

        const downloadBtn = this.shadowRoot.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }

        // Mouse/touch controls for box rotation
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaMove = {
                x: e.clientX - this.previousMousePosition.x,
                y: e.clientY - this.previousMousePosition.y
            };

            this.rotationY += deltaMove.x * 0.01;
            this.rotationX += deltaMove.y * 0.01;

            // Clamp rotation
            this.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotationX));

            if (this.softwareBox) {
                this.softwareBox.rotation.x = this.rotationX;
                this.softwareBox.rotation.y = this.rotationY;
            }

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });

        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const currentDistance = this.camera.position.length();
            const newDistance = Math.max(3, Math.min(15, currentDistance + (e.deltaY * zoomSpeed * 0.01)));
            
            // Update camera position
            this.camera.position.normalize().multiplyScalar(newDistance);
            
            // Update distance slider
            const distanceSlider = this.shadowRoot.getElementById('camera-distance');
            if (distanceSlider) {
                distanceSlider.value = newDistance;
                this.updateValueDisplay('camera-distance', newDistance.toFixed(1));
            }
        });

        // Set initial cursor
        canvas.style.cursor = 'grab';
    }

    handleArtworkUpload(event, face) {
        const file = event.target.files[0];
        if (!file) return;

        this.showLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const loader = new THREE.TextureLoader();
            loader.load(e.target.result, (texture) => {
                texture.flipY = false;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                
                this.textures[face] = texture;
                this.updateBoxTexture(face, texture);
                this.showLoading(false);
            });
        };
        reader.readAsDataURL(file);
    }

    updateBoxTexture(face, texture) {
        if (!this.softwareBox) return;

        const material = new THREE.MeshPhysicalMaterial({
            map: texture,
            metalness: 0.1,
            roughness: 0.2,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            reflectivity: 0.8
        });

        // Apply texture to the box
        this.softwareBox.material = material;
    }

    handleSliderChange(sliderId, value) {
        this.updateValueDisplay(sliderId, value);

        switch (sliderId) {
            case 'camera-distance':
                const distance = parseFloat(value);
                this.camera.position.normalize().multiplyScalar(distance);
                break;

            case 'camera-fov':
                this.camera.fov = parseFloat(value);
                this.camera.updateProjectionMatrix();
                break;

            case 'ambient-intensity':
                if (this.ambientLight) {
                    this.ambientLight.intensity = parseFloat(value);
                }
                break;

            case 'shadow-intensity':
                if (this.directionalLight) {
                    this.directionalLight.shadow.radius = parseFloat(value) * 10;
                }
                break;

            case 'light-h-blur':
            case 'light-v-blur':
                if (this.directionalLight) {
                    this.directionalLight.shadow.blurSamples = Math.max(5, parseInt(parseFloat(value) * 50));
                }
                break;
        }
    }

    updateValueDisplay(sliderId, value) {
        const display = this.shadowRoot.getElementById(`${sliderId}-value`);
        if (!display) return;

        let displayValue = value;
        if (sliderId === 'camera-fov') {
            displayValue = `${value}°`;
        } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            displayValue = parseFloat(value).toFixed(2);
        }

        display.textContent = displayValue;
    }

    showLoading(show) {
        const loading = this.shadowRoot.getElementById('loading');
        if (loading) {
            loading.classList.toggle('show', show);
        }
    }

    resetArtwork() {
        // Reset all textures
        Object.keys(this.textures).forEach(face => {
            this.textures[face] = null;
        });

        // Reset box material
        if (this.softwareBox) {
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.2,
                clearcoat: 0.3,
                clearcoatRoughness: 0.1,
                reflectivity: 0.8
            });
            this.softwareBox.material = material;
        }

        // Reset file inputs
        const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
        faces.forEach(face => {
            const input = this.shadowRoot.getElementById(`${face}-artwork`);
            if (input) {
                input.value = '';
            }
        });
    }

    resetParameters() {
        // Reset all sliders to default values
        Object.entries(this.defaultParams).forEach(([param, value]) => {
            let sliderId;
            switch (param) {
                case 'cameraDistance': sliderId = 'camera-distance'; break;
                case 'cameraFov': sliderId = 'camera-fov'; break;
                case 'dofIntensity': sliderId = 'dof-intensity'; break;
                case 'focusDistance': sliderId = 'focus-distance'; break;
                case 'lightHBlur': sliderId = 'light-h-blur'; break;
                case 'lightVBlur': sliderId = 'light-v-blur'; break;
                case 'ambientIntensity': sliderId = 'ambient-intensity'; break;
                case 'shadowIntensity': sliderId = 'shadow-intensity'; break;
            }

            if (sliderId) {
                const slider = this.shadowRoot.getElementById(sliderId);
                if (slider) {
                    slider.value = value;
                    this.handleSliderChange(sliderId, value);
                }
            }
        });

        // Reset camera position
        this.updateCameraPosition();

        // Reset box rotation
        this.rotationX = 0.2;
        this.rotationY = 0.3;
        if (this.softwareBox) {
            this.softwareBox.rotation.x = this.rotationX;
            this.softwareBox.rotation.y = this.rotationY;
        }
    }

    downloadImage() {
        this.showLoading(true);
        
        // Render at high resolution
        const originalSize = this.renderer.getSize(new THREE.Vector2());
        const downloadWidth = 1920;
        const downloadHeight = 1080;
        
        this.renderer.setSize(downloadWidth, downloadHeight);
        this.camera.aspect = downloadWidth / downloadHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.render(this.scene, this.camera);
        
        // Create download link
        const canvas = this.renderer.domElement;
        const link = document.createElement('a');
        link.download = 'software-box-mockup.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restore original size
        this.renderer.setSize(originalSize.x, originalSize.y);
        this.camera.aspect = originalSize.x / originalSize.y;
        this.camera.updateProjectionMatrix();
        
        this.showLoading(false);
    }

    handleResize() {
        const container = this.shadowRoot.getElementById('canvas-container');
        if (!container || !this.renderer || !this.camera) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        requestAnimationFrame(() => this.animate());
        
        // No automatic rotation - only manual rotation via mouse drag
        this.renderer.render(this.scene, this.camera);
    }

    connectedCallback() {
        // Element is connected to DOM
    }

    disconnectedCallback() {
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Define the custom element
customElements.define('advanced-mockup-builder', AdvancedMockupBuilder);
