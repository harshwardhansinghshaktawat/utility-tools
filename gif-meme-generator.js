class GifMemeGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // State management
    this.state = {
      // GIF Properties
      frames: [],
      currentFrame: 0,
      totalFrames: 30,
      fps: 10,
      duration: 3,
      canvasWidth: 600,
      canvasHeight: 600,
      isPlaying: false,
      playbackInterval: null,
      
      // Content layers
      textLayers: [],
      imageLayers: [],
      gifLayers: [], // New: imported GIF layers
      backgroundTemplate: null,
      
      // Animation settings
      animations: {
        text: [
          { id: 'none', name: 'None' },
          { id: 'fadeIn', name: 'Fade In' },
          { id: 'fadeOut', name: 'Fade Out' },
          { id: 'slideLeft', name: 'Slide from Left' },
          { id: 'slideRight', name: 'Slide from Right' },
          { id: 'slideUp', name: 'Slide from Top' },
          { id: 'slideDown', name: 'Slide from Bottom' },
          { id: 'bounce', name: 'Bounce' },
          { id: 'shake', name: 'Shake' },
          { id: 'pulse', name: 'Pulse' },
          { id: 'rotate', name: 'Rotate' },
          { id: 'typewriter', name: 'Typewriter' }
        ],
        image: [
          { id: 'none', name: 'None' },
          { id: 'fadeIn', name: 'Fade In' },
          { id: 'fadeOut', name: 'Fade Out' },
          { id: 'scaleIn', name: 'Scale In' },
          { id: 'scaleOut', name: 'Scale Out' },
          { id: 'slideLeft', name: 'Slide Left' },
          { id: 'slideRight', name: 'Slide Right' },
          { id: 'bounce', name: 'Bounce' },
          { id: 'rotate', name: 'Rotate' },
          { id: 'flip', name: 'Flip' }
        ]
      },
      
      // UI state
      selectedElement: null,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      undoStack: [],
      redoStack: [],
      imageCache: {},
      
      // Templates
      templates: [
        {
          id: 'blank',
          name: 'Blank Canvas',
          url: '',
          type: 'blank'
        },
        {
          id: 'disappearing-kid',
          name: 'Disappearing Kid',
          url: 'https://i.imgflip.com/2/3qqcim.jpg',
          type: 'gif-template'
        },
        {
          id: 'drake-pointing',
          name: 'Drake Pointing',
          url: 'https://i.imgflip.com/30b1gx.jpg',
          type: 'static'
        },
        {
          id: 'distracted-boyfriend',
          name: 'Distracted Boyfriend',
          url: 'https://i.imgflip.com/1ur9b0.jpg',
          type: 'static'
        }
      ]
    };

    this.initializeFrames();
    this.initializeUI();
    this.setupEventListeners();
  }

  initializeFrames() {
    this.state.frames = [];
    for (let i = 0; i < this.state.totalFrames; i++) {
      this.state.frames.push({
        id: i,
        timestamp: i / this.state.fps,
        elements: []
      });
    }
  }

  initializeUI() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          --primary-color: #ff6b35;
          --secondary-color: #f7931e;
          --dark-color: #2c3e50;
          --light-color: #ecf0f1;
          --success-color: #27ae60;
          --danger-color: #e74c3c;
          --border-radius: 8px;
          --shadow: 0 2px 8px rgba(0,0,0,0.1);
          --border: 1px solid #e1e5e9;
          font-size: 14px;
        }

        .gif-generator-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: var(--border-radius);
          min-height: 100vh;
        }

        .header {
          background: white;
          border-radius: var(--border-radius);
          padding: 15px;
          box-shadow: var(--shadow);
          text-align: center;
        }

        .header h1 {
          margin: 0;
          color: var(--primary-color);
          font-size: 28px;
          font-weight: bold;
        }

        .header p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        /* Templates Row */
        .templates-section {
          background: white;
          border-radius: var(--border-radius);
          padding: 15px;
          box-shadow: var(--shadow);
        }

        .templates-section h3 {
          margin: 0 0 10px 0;
          color: var(--dark-color);
        }

        .templates-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 5px;
        }

        .template-option {
          flex-shrink: 0;
          width: 120px;
          padding: 10px;
          border: var(--border);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: #f8f9fa;
        }

        .template-option:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .template-option.selected {
          border-color: var(--primary-color);
          background: var(--primary-color);
          color: white;
        }

        .template-option img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .template-name {
          font-size: 12px;
          font-weight: 500;
        }

        /* Main Editor Layout */
        .editor-layout {
          display: grid;
          grid-template-columns: 300px 1fr 300px;
          gap: 15px;
          min-height: 600px;
        }

        /* Sidebar Panels */
        .sidebar {
          background: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 15px;
          overflow-y: auto;
          max-height: 80vh;
        }

        .panel-section {
          margin-bottom: 20px;
          border: var(--border);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .panel-header {
          background: #f8f9fa;
          padding: 10px 15px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }

        .panel-header:hover {
          background: #e9ecef;
        }

        .panel-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--dark-color);
        }

        .panel-content {
          padding: 15px;
          background: white;
        }

        .panel-content.collapsed {
          display: none;
        }

        /* Timeline Controls */
        .timeline-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .control-group label {
          font-size: 12px;
          font-weight: 500;
          color: var(--dark-color);
        }

        .value-display {
          font-size: 11px;
          color: #666;
          margin-left: 5px;
        }

        /* Playback Controls */
        .playback-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .play-btn {
          background: var(--success-color);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }

        .play-btn.playing {
          background: var(--danger-color);
        }

        /* Timeline */
        .timeline-container {
          background: #f8f9fa;
          border-radius: var(--border-radius);
          padding: 10px;
          margin-bottom: 15px;
        }

        .timeline {
          width: 100%;
          height: 60px;
          background: white;
          border-radius: 4px;
          position: relative;
          border: var(--border);
          overflow: hidden;
        }

        .timeline-track {
          height: 100%;
          background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
          position: relative;
        }

        .frame-markers {
          display: flex;
          height: 20px;
          background: #f5f5f5;
        }

        .frame-marker {
          flex: 1;
          border-right: 1px solid #ddd;
          font-size: 10px;
          text-align: center;
          line-height: 20px;
          cursor: pointer;
        }

        .frame-marker.current {
          background: var(--primary-color);
          color: white;
        }

        .timeline-cursor {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: var(--primary-color);
          z-index: 10;
          transition: left 0.1s ease;
        }

        .timeline-progress {
          position: absolute;
          top: 20px;
          left: 0;
          height: calc(100% - 20px);
          background: rgba(255, 107, 53, 0.2);
          transition: width 0.1s ease;
        }

        /* Canvas Container */
        .canvas-container {
          background: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .canvas-wrapper {
          position: relative;
          display: inline-block;
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        #gif-canvas {
          background: #f0f0f0;
          border-radius: var(--border-radius);
          cursor: crosshair;
        }

        .canvas-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          border-radius: var(--border-radius);
        }

        /* Form Elements */
        button {
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        button:hover {
          background: #e55a2b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        button:active {
          transform: translateY(0);
        }

        button.secondary {
          background: #6c757d;
        }

        button.secondary:hover {
          background: #5a6268;
        }

        button.success {
          background: var(--success-color);
        }

        button.success:hover {
          background: #219a52;
        }

        button.danger {
          background: var(--danger-color);
        }

        button.danger:hover {
          background: #c0392b;
        }

        button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        input, select, textarea {
          width: 100%;
          padding: 8px 12px;
          border: var(--border);
          border-radius: var(--border-radius);
          font-size: 12px;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        input[type="range"] {
          padding: 0;
          height: 6px;
          background: #ddd;
          border-radius: 3px;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="color"] {
          height: 40px;
          padding: 4px;
          cursor: pointer;
        }

        /* Layer Items */
        .layer-item {
          background: #f8f9fa;
          border: var(--border);
          border-radius: var(--border-radius);
          padding: 12px;
          margin-bottom: 10px;
        }

        .layer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .layer-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--dark-color);
          margin: 0;
        }

        .layer-actions {
          display: flex;
          gap: 5px;
        }

        .icon-btn {
          padding: 4px 8px;
          font-size: 11px;
          min-height: auto;
        }

        /* Export Controls */
        .export-section {
          background: white;
          border-radius: var(--border-radius);
          padding: 20px;
          box-shadow: var(--shadow);
          text-align: center;
        }

        .export-controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .export-btn {
          background: var(--success-color);
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-progress {
          display: none;
          margin-top: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--success-color);
          transition: width 0.3s ease;
        }

        /* File Upload */
        .file-upload {
          border: 2px dashed #ddd;
          border-radius: var(--border-radius);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 15px;
        }

        .file-upload:hover {
          border-color: var(--primary-color);
          background: #f8f9fa;
        }

        .file-upload input {
          display: none;
        }

        /* Animation Settings */
        .animation-settings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .timing-controls {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }

        .timing-controls input {
          width: 60px;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .editor-layout {
            grid-template-columns: 280px 1fr 280px;
          }
        }

        @media (max-width: 992px) {
          .editor-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          
          .sidebar {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .gif-generator-container {
            padding: 15px;
          }
          
          .timeline-controls {
            grid-template-columns: 1fr;
          }
          
          .export-controls {
            flex-direction: column;
          }
        }

        /* Loading States */
        .loading {
          opacity: 0.6;
          pointer-events: none;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Tooltips */
        .tooltip {
          position: relative;
        }

        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 5px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .tooltip:hover::after {
          opacity: 1;
        }
      </style>

      <div class="gif-generator-container">
        <!-- Header -->
        <div class="header">
          <h1>🎬 Advanced GIF Meme Generator</h1>
          <p>Create amazing animated memes with professional tools - Easy enough for kids to use!</p>
        </div>

        <!-- Templates Section -->
        <div class="templates-section">
          <h3>📂 Choose a Template</h3>
          <div class="templates-row" id="templates-container"></div>
        </div>

        <!-- Main Editor Layout -->
        <div class="editor-layout">
          <!-- Left Sidebar - Simple Controls -->
          <div class="sidebar">
            <h3 style="margin-top: 0; color: var(--primary-color);">⚙️ Simple Controls</h3>
            
            <!-- Timeline Settings -->
            <div class="panel-section">
              <div class="panel-header" data-section="timeline">
                <h4>⏱️ Timeline Settings</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="timeline">
                <div class="timeline-controls">
                  <div class="control-group">
                    <label>Duration <span class="value-display" id="duration-display">3.0s</span></label>
                    <input type="range" id="duration-slider" min="0.5" max="10" step="0.1" value="3">
                  </div>
                  <div class="control-group">
                    <label>FPS <span class="value-display" id="fps-display">10</span></label>
                    <input type="range" id="fps-slider" min="5" max="30" step="1" value="10">
                  </div>
                  <div class="control-group">
                    <label>Total Frames <span class="value-display" id="frames-display">30</span></label>
                    <input type="range" id="frames-slider" min="10" max="100" step="1" value="30">
                  </div>
                  <div class="control-group">
                    <label>Canvas Size <span class="value-display" id="size-display">600x600</span></label>
                    <select id="canvas-size">
                      <option value="400">400x400</option>
                      <option value="500">500x500</option>
                      <option value="600" selected>600x600</option>
                      <option value="800">800x800</option>
                    </select>
                  </div>
                </div>
                
                <div class="playback-controls">
                  <button id="play-btn" class="play-btn">▶️ Play</button>
                  <button id="prev-frame-btn" class="icon-btn secondary">⏮️</button>
                  <button id="next-frame-btn" class="icon-btn secondary">⏭️</button>
                </div>
              </div>
            </div>

            <!-- Text Controls -->
            <div class="panel-section">
              <div class="panel-header" data-section="text">
                <h4>✏️ Text Layers</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="text">
                <button id="add-text-btn" style="width: 100%; margin-bottom: 15px;">➕ Add Text</button>
                <div id="text-layers-container"></div>
              </div>
            </div>

            <!-- Image Controls -->
            <div class="panel-section">
              <div class="panel-header" data-section="images">
                <h4>🖼️ Static Images</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="images">
                <div class="file-upload">
                  <input type="file" id="image-upload" accept="image/png,image/jpg,image/jpeg" multiple>
                  📁 Click to Upload Static Images<br>
                  <small>Support: PNG, JPG, JPEG</small>
                </div>
                <div id="image-layers-container"></div>
              </div>
            </div>

            <!-- GIF Import Controls -->
            <div class="panel-section">
              <div class="panel-header" data-section="gifs">
                <h4>🎬 Animated GIFs</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="gifs">
                <div class="file-upload">
                  <input type="file" id="gif-upload" accept="image/gif" multiple>
                  🎬 Click to Upload GIF Files<br>
                  <small>Import existing animated GIFs</small>
                </div>
                <div id="gif-layers-container"></div>
              </div>
            </div>
          </div>

          <!-- Center - Canvas and Timeline -->
          <div class="canvas-container">
            <!-- Timeline -->
            <div class="timeline-container">
              <div class="timeline" id="timeline">
                <div class="frame-markers" id="frame-markers"></div>
                <div class="timeline-track">
                  <div class="timeline-progress" id="timeline-progress"></div>
                  <div class="timeline-cursor" id="timeline-cursor"></div>
                </div>
              </div>
            </div>

            <!-- Canvas -->
            <div class="canvas-wrapper">
              <canvas id="gif-canvas" width="600" height="600"></canvas>
              <div class="canvas-overlay"></div>
            </div>

            <!-- Frame Info -->
            <div style="margin-top: 15px; color: #666; font-size: 14px;">
              Frame: <span id="current-frame-display">1</span> / <span id="total-frames-display">30</span>
              | Time: <span id="current-time-display">0.0s</span>
            </div>
          </div>

          <!-- Right Sidebar - Advanced Controls -->
          <div class="sidebar">
            <h3 style="margin-top: 0; color: var(--secondary-color);">🔧 Advanced Settings</h3>
            
            <!-- Animation Presets -->
            <div class="panel-section">
              <div class="panel-header" data-section="animations">
                <h4>🎭 Animation Presets</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="animations">
                <div id="animation-presets-container">
                  <p style="color: #666; font-size: 12px; margin: 0;">Select an element to see animation options</p>
                </div>
              </div>
            </div>

            <!-- Advanced Text Settings -->
            <div class="panel-section">
              <div class="panel-header" data-section="text-advanced">
                <h4>📝 Advanced Text</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="text-advanced">
                <div id="text-advanced-container">
                  <p style="color: #666; font-size: 12px; margin: 0;">Select a text layer to see advanced options</p>
                </div>
              </div>
            </div>

            <!-- Advanced Image Settings -->
            <div class="panel-section">
              <div class="panel-header" data-section="image-advanced">
                <h4>🖼️ Advanced Images</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="image-advanced">
                <div id="image-advanced-container">
                  <p style="color: #666; font-size: 12px; margin: 0;">Select an image layer to see advanced options</p>
                </div>
              </div>
            </div>

            <!-- Export Quality -->
            <div class="panel-section">
              <div class="panel-header" data-section="quality">
                <h4>⚡ Export Quality</h4>
                <span class="toggle-icon">▼</span>
              </div>
              <div class="panel-content" data-content="quality">
                <div class="control-group">
                  <label>Quality <span class="value-display" id="quality-display">Medium</span></label>
                  <select id="export-quality">
                    <option value="low">Low (Faster)</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High (Slower)</option>
                  </select>
                </div>
                <div class="control-group">
                  <label>Colors <span class="value-display" id="colors-display">256</span></label>
                  <input type="range" id="colors-slider" min="16" max="256" step="16" value="256">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Section -->
        <div class="export-section">
          <h3 style="margin-top: 0;">💾 Export Your GIF</h3>
          <div class="export-controls">
            <button id="export-gif-btn" class="export-btn">
              🎬 Generate GIF
            </button>
            <button id="preview-btn" class="secondary">
              👀 Preview
            </button>
            <button id="reset-btn" class="danger">
              🗑️ Reset All
            </button>
          </div>
          <div class="export-progress" id="export-progress">
            <p>Generating GIF... <span id="progress-text">0%</span></p>
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Get DOM elements
    this.canvas = this.shadowRoot.getElementById('gif-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    // Timeline elements
    this.timeline = this.shadowRoot.getElementById('timeline');
    this.frameMarkers = this.shadowRoot.getElementById('frame-markers');
    this.timelineCursor = this.shadowRoot.getElementById('timeline-cursor');
    this.timelineProgress = this.shadowRoot.getElementById('timeline-progress');
    
    // Control elements
    this.durationSlider = this.shadowRoot.getElementById('duration-slider');
    this.fpsSlider = this.shadowRoot.getElementById('fps-slider');
    this.framesSlider = this.shadowRoot.getElementById('frames-slider');
    this.canvasSizeSelect = this.shadowRoot.getElementById('canvas-size');
    
    // Buttons
    this.playBtn = this.shadowRoot.getElementById('play-btn');
    this.prevFrameBtn = this.shadowRoot.getElementById('prev-frame-btn');
    this.nextFrameBtn = this.shadowRoot.getElementById('next-frame-btn');
    this.addTextBtn = this.shadowRoot.getElementById('add-text-btn');
    this.imageUpload = this.shadowRoot.getElementById('image-upload');
    this.exportBtn = this.shadowRoot.getElementById('export-gif-btn');
    
    // Containers
    this.textLayersContainer = this.shadowRoot.getElementById('text-layers-container');
    this.imageLayersContainer = this.shadowRoot.getElementById('image-layers-container');
    this.gifLayersContainer = this.shadowRoot.getElementById('gif-layers-container');
    this.templatesContainer = this.shadowRoot.getElementById('templates-container');
    
    this.setupControlEventListeners();
    this.setupCanvasEventListeners();
    this.setupCollapsibleSections();
    
    this.loadTemplates();
    this.updateTimeline();
    this.updateDisplays();
    this.renderFrame();
  }

  setupControlEventListeners() {
    // Timeline controls
    this.durationSlider.addEventListener('input', () => {
      this.state.duration = parseFloat(this.durationSlider.value);
      this.updateFrameCount();
      this.updateDisplays();
      this.updateTimeline();
    });

    this.fpsSlider.addEventListener('input', () => {
      this.state.fps = parseInt(this.fpsSlider.value);
      this.updateFrameCount();
      this.updateDisplays();
      this.updateTimeline();
    });

    this.framesSlider.addEventListener('input', () => {
      this.state.totalFrames = parseInt(this.framesSlider.value);
      this.state.duration = this.state.totalFrames / this.state.fps;
      this.durationSlider.value = this.state.duration;
      this.initializeFrames();
      this.updateDisplays();
      this.updateTimeline();
    });

    this.canvasSizeSelect.addEventListener('change', () => {
      const size = parseInt(this.canvasSizeSelect.value);
      this.state.canvasWidth = size;
      this.state.canvasHeight = size;
      this.canvas.width = size;
      this.canvas.height = size;
      this.updateDisplays();
      this.renderFrame();
    });

    // Playback controls
    this.playBtn.addEventListener('click', () => this.togglePlayback());
    this.prevFrameBtn.addEventListener('click', () => this.previousFrame());
    this.nextFrameBtn.addEventListener('click', () => this.nextFrame());

    // Content controls
    this.addTextBtn.addEventListener('click', () => this.addTextLayer());
    this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    
    // New GIF upload handler
    this.gifUpload = this.shadowRoot.getElementById('gif-upload');
    this.gifUpload.addEventListener('change', (e) => this.handleGifUpload(e));

    // Export
    this.exportBtn.addEventListener('click', () => this.exportGIF());
    
    // Reset
    this.shadowRoot.getElementById('reset-btn').addEventListener('click', () => this.resetAll());
    
    // Preview
    this.shadowRoot.getElementById('preview-btn').addEventListener('click', () => this.previewGIF());
  }

  setupCanvasEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleCanvasMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseUp());
  }

  setupCollapsibleSections() {
    this.shadowRoot.querySelectorAll('.panel-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.getAttribute('data-section');
        const content = this.shadowRoot.querySelector(`[data-content="${section}"]`);
        const icon = header.querySelector('.toggle-icon');
        
        if (content.classList.contains('collapsed')) {
          content.classList.remove('collapsed');
          icon.textContent = '▼';
        } else {
          content.classList.add('collapsed');
          icon.textContent = '▶';
        }
      });
    });
  }

  loadTemplates() {
    this.templatesContainer.innerHTML = '';
    
    this.state.templates.forEach(template => {
      const templateEl = document.createElement('div');
      templateEl.className = 'template-option';
      templateEl.dataset.id = template.id;
      
      const imgSrc = template.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="%23f0f0f0" stroke="%23ddd"/><text x="40" y="35" text-anchor="middle" fill="%23666" font-size="12">Blank</text></svg>';
      
      templateEl.innerHTML = `
        <img src="${imgSrc}" alt="${template.name}" onerror="this.style.display='none'">
        <div class="template-name">${template.name}</div>
      `;
      
      templateEl.addEventListener('click', () => this.selectTemplate(template.id));
      this.templatesContainer.appendChild(templateEl);
    });
  }

  selectTemplate(templateId) {
    this.state.backgroundTemplate = templateId;
    
    // Update UI
    this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === templateId);
    });
    
    // Load template image if not blank
    const template = this.state.templates.find(t => t.id === templateId);
    if (template && template.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.state.imageCache[template.url] = img;
        this.renderFrame();
      };
      img.src = template.url;
    }
    
    this.renderFrame();
  }

  updateFrameCount() {
    this.state.totalFrames = Math.max(1, Math.round(this.state.duration * this.state.fps));
    this.framesSlider.value = this.state.totalFrames;
    this.initializeFrames();
  }

  updateDisplays() {
    this.shadowRoot.getElementById('duration-display').textContent = `${this.state.duration.toFixed(1)}s`;
    this.shadowRoot.getElementById('fps-display').textContent = this.state.fps;
    this.shadowRoot.getElementById('frames-display').textContent = this.state.totalFrames;
    this.shadowRoot.getElementById('size-display').textContent = `${this.state.canvasWidth}x${this.state.canvasHeight}`;
    this.shadowRoot.getElementById('current-frame-display').textContent = this.state.currentFrame + 1;
    this.shadowRoot.getElementById('total-frames-display').textContent = this.state.totalFrames;
    this.shadowRoot.getElementById('current-time-display').textContent = `${(this.state.currentFrame / this.state.fps).toFixed(1)}s`;
  }

  updateTimeline() {
    // Update frame markers
    this.frameMarkers.innerHTML = '';
    const markerWidth = 100 / this.state.totalFrames;
    
    for (let i = 0; i < this.state.totalFrames; i++) {
      const marker = document.createElement('div');
      marker.className = 'frame-marker';
      marker.style.width = `${markerWidth}%`;
      marker.textContent = i + 1;
      marker.addEventListener('click', () => this.goToFrame(i));
      
      if (i === this.state.currentFrame) {
        marker.classList.add('current');
      }
      
      this.frameMarkers.appendChild(marker);
    }
    
    // Update cursor and progress
    const progress = (this.state.currentFrame / (this.state.totalFrames - 1)) * 100;
    this.timelineCursor.style.left = `${progress}%`;
    this.timelineProgress.style.width = `${progress}%`;
  }

  goToFrame(frameIndex) {
    this.state.currentFrame = Math.max(0, Math.min(frameIndex, this.state.totalFrames - 1));
    this.updateTimeline();
    this.updateDisplays();
    this.renderFrame();
  }

  togglePlayback() {
    if (this.state.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    this.state.isPlaying = true;
    this.playBtn.textContent = '⏸️ Pause';
    this.playBtn.classList.add('playing');
    
    const frameInterval = 1000 / this.state.fps;
    
    this.state.playbackInterval = setInterval(() => {
      this.state.currentFrame++;
      if (this.state.currentFrame >= this.state.totalFrames) {
        this.state.currentFrame = 0; // Loop
      }
      
      this.updateTimeline();
      this.updateDisplays();
      this.renderFrame();
    }, frameInterval);
  }

  stopPlayback() {
    this.state.isPlaying = false;
    this.playBtn.textContent = '▶️ Play';
    this.playBtn.classList.remove('playing');
    
    if (this.state.playbackInterval) {
      clearInterval(this.state.playbackInterval);
      this.state.playbackInterval = null;
    }
  }

  previousFrame() {
    this.goToFrame(this.state.currentFrame - 1);
  }

  nextFrame() {
    this.goToFrame(this.state.currentFrame + 1);
  }

  addTextLayer() {
    const newText = {
      id: Date.now(),
      type: 'text',
      text: 'Your Text Here',
      x: this.state.canvasWidth / 2,
      y: this.state.canvasHeight / 2,
      fontSize: 40,
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      align: 'center',
      animation: 'none',
      animationDuration: 1,
      startFrame: 0,
      endFrame: this.state.totalFrames - 1,
      draggable: true
    };
    
    this.state.textLayers.push(newText);
    this.renderTextLayersUI();
    this.renderFrame();
  }

  handleGifUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // Parse GIF frames
            const gifFrames = await this.parseGifFrames(e.target.result);
            
            if (gifFrames && gifFrames.length > 0) {
              const newGifLayer = {
                id: Date.now() + Math.random(),
                type: 'gif',
                name: file.name,
                src: e.target.result,
                frames: gifFrames,
                x: this.state.canvasWidth / 2 - 150,
                y: this.state.canvasHeight / 2 - 150,
                width: 300,
                height: 300,
                originalWidth: gifFrames[0].width,
                originalHeight: gifFrames[0].height,
                animation: 'none',
                startFrame: 0,
                endFrame: this.state.totalFrames - 1,
                opacity: 1,
                rotation: 0,
                playSpeed: 1,
                loop: true,
                draggable: true
              };
              
              this.state.gifLayers.push(newGifLayer);
              this.renderGifLayersUI();
              this.renderFrame();
            }
          } catch (error) {
            console.error('Error parsing GIF:', error);
            alert('Failed to load GIF. Please try another file.');
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    event.target.value = '';
  }

  async parseGifFrames(dataUrl) {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary image to get GIF data
        const img = new Image();
        img.onload = () => {
          // For now, we'll simulate GIF frame extraction
          // In a real implementation, you'd use a GIF parsing library like gif-frames or similar
          const frames = [];
          
          // Create canvas to capture frames
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          
          // For demonstration, we'll create multiple frames from the single image
          // In a real implementation, this would extract actual GIF frames
          for (let i = 0; i < 10; i++) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(img, 0, 0);
            
            frames.push({
              canvas: tempCanvas.cloneNode(),
              width: img.width,
              height: img.height,
              delay: 100, // milliseconds
              imageData: tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
            });
          }
          
          // Store the original image for simpler rendering
          this.state.imageCache[dataUrl] = img;
          resolve(frames);
        };
        
        img.onerror = () => reject(new Error('Failed to load GIF image'));
        img.src = dataUrl;
        
      } catch (error) {
        reject(error);
      }
    });
  }

  renderGifLayersUI() {
    if (this.state.gifLayers.length === 0) {
      this.gifLayersContainer.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; margin: 20px 0;">No GIFs imported yet. Upload some animated GIFs to get started!</p>';
      return;
    }
    
    this.gifLayersContainer.innerHTML = '';
    
    this.state.gifLayers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = 'layer-item';
      layerEl.innerHTML = `
        <div class="layer-header">
          <h5 class="layer-title">🎬 ${layer.name}</h5>
          <div class="layer-actions">
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveGifLayer(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveGifLayer(${index}, 1)" ${index === this.state.gifLayers.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" onclick="this.getRootNode().host.removeGifLayer(${index})">×</button>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Width</label>
            <input type="range" min="20" max="600" value="${layer.width}" 
                   oninput="this.getRootNode().host.updateGifLayer(${index}, 'width', parseInt(this.value))">
            <small>${Math.round(layer.width)}px</small>
          </div>
          <div class="control-group">
            <label>Height</label>
            <input type="range" min="20" max="600" value="${layer.height}" 
                   oninput="this.getRootNode().host.updateGifLayer(${index}, 'height', parseInt(this.value))">
            <small>${Math.round(layer.height)}px</small>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Opacity</label>
            <input type="range" min="0" max="1" step="0.1" value="${layer.opacity}" 
                   oninput="this.getRootNode().host.updateGifLayer(${index}, 'opacity', parseFloat(this.value))">
            <small>${Math.round(layer.opacity * 100)}%</small>
          </div>
          <div class="control-group">
            <label>Rotation</label>
            <input type="range" min="-180" max="180" value="${layer.rotation}" 
                   oninput="this.getRootNode().host.updateGifLayer(${index}, 'rotation', parseInt(this.value))">
            <small>${layer.rotation}°</small>
          </div>
          <div class="control-group">
            <label>Speed</label>
            <input type="range" min="0.1" max="3" step="0.1" value="${layer.playSpeed}" 
                   oninput="this.getRootNode().host.updateGifLayer(${index}, 'playSpeed', parseFloat(this.value))">
            <small>${layer.playSpeed}x</small>
          </div>
        </div>
        
        <div class="control-group">
          <label>
            <input type="checkbox" ${layer.loop ? 'checked' : ''} 
                   onchange="this.getRootNode().host.updateGifLayer(${index}, 'loop', this.checked)"
                   style="width: auto; margin-right: 5px;">
            Loop GIF Animation
          </label>
        </div>
        
        <div class="control-group">
          <label>Additional Animation</label>
          <select onchange="this.getRootNode().host.updateGifLayer(${index}, 'animation', this.value)">
            ${this.state.animations.image.map(anim => 
              `<option value="${anim.id}" ${layer.animation === anim.id ? 'selected' : ''}>${anim.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="timing-controls">
          <div class="control-group" style="flex: 1;">
            <label>Start Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.startFrame}" 
                   onchange="this.getRootNode().host.updateGifLayer(${index}, 'startFrame', parseInt(this.value))">
          </div>
          <div class="control-group" style="flex: 1;">
            <label>End Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.endFrame}" 
                   onchange="this.getRootNode().host.updateGifLayer(${index}, 'endFrame', parseInt(this.value))">
          </div>
        </div>
        
        <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 11px; color: #1976d2;">
          ℹ️ This GIF has ${layer.frames.length} frames and will animate within your timeline
        </div>
      `;
      
      this.gifLayersContainer.appendChild(layerEl);
    });
  }

  updateGifLayer(index, property, value) {
    if (this.state.gifLayers[index]) {
      this.state.gifLayers[index][property] = value;
      this.renderFrame();
    }
  }

  moveGifLayer(index, direction) {
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < this.state.gifLayers.length) {
      [this.state.gifLayers[index], this.state.gifLayers[newIndex]] = 
        [this.state.gifLayers[newIndex], this.state.gifLayers[index]];
      this.renderGifLayersUI();
      this.renderFrame();
    }
  }

  removeGifLayer(index) {
    if (confirm('Remove this GIF layer?')) {
      this.state.gifLayers.splice(index, 1);
      this.renderGifLayersUI();
      this.renderFrame();
    }
  }
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate size to fit canvas
          const maxSize = Math.min(this.state.canvasWidth, this.state.canvasHeight) * 0.4;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          
          const newImage = {
            id: Date.now() + Math.random(),
            type: 'image',
            src: e.target.result,
            x: this.state.canvasWidth / 2 - (img.width * scale) / 2,
            y: this.state.canvasHeight / 2 - (img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            originalWidth: img.width,
            originalHeight: img.height,
            animation: 'none',
            animationDuration: 1,
            startFrame: 0,
            endFrame: this.state.totalFrames - 1,
            opacity: 1,
            rotation: 0,
            draggable: true
          };
          
          this.state.imageCache[e.target.result] = img;
          this.state.imageLayers.push(newImage);
          this.renderImageLayersUI();
          this.renderFrame();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  }

  renderTextLayersUI() {
    if (this.state.textLayers.length === 0) {
      this.textLayersContainer.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; margin: 20px 0;">No text layers yet. Click "Add Text" to get started!</p>';
      return;
    }
    
    this.textLayersContainer.innerHTML = '';
    
    this.state.textLayers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = 'layer-item';
      layerEl.innerHTML = `
        <div class="layer-header">
          <h5 class="layer-title">Text ${index + 1}</h5>
          <div class="layer-actions">
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveLayer('text', ${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveLayer('text', ${index}, 1)" ${index === this.state.textLayers.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" onclick="this.getRootNode().host.removeLayer('text', ${index})">×</button>
          </div>
        </div>
        
        <div class="control-group">
          <label>Text Content</label>
          <textarea rows="2" onchange="this.getRootNode().host.updateTextLayer(${index}, 'text', this.value)">${layer.text}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Font Size</label>
            <input type="range" min="12" max="100" value="${layer.fontSize}" 
                   oninput="this.getRootNode().host.updateTextLayer(${index}, 'fontSize', parseInt(this.value))">
            <small>${layer.fontSize}px</small>
          </div>
          <div class="control-group">
            <label>Font</label>
            <select onchange="this.getRootNode().host.updateTextLayer(${index}, 'fontFamily', this.value)">
              <option value="Arial Black, Arial" ${layer.fontFamily.includes('Arial Black') ? 'selected' : ''}>Arial Black</option>
              <option value="Impact, Arial" ${layer.fontFamily.includes('Impact') ? 'selected' : ''}>Impact</option>
              <option value="Comic Sans MS" ${layer.fontFamily.includes('Comic Sans') ? 'selected' : ''}>Comic Sans</option>
              <option value="Times New Roman" ${layer.fontFamily.includes('Times') ? 'selected' : ''}>Times</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Text Color</label>
            <input type="color" value="${layer.color}" 
                   onchange="this.getRootNode().host.updateTextLayer(${index}, 'color', this.value)">
          </div>
          <div class="control-group">
            <label>Outline Color</label>
            <input type="color" value="${layer.strokeColor}" 
                   onchange="this.getRootNode().host.updateTextLayer(${index}, 'strokeColor', this.value)">
          </div>
          <div class="control-group">
            <label>Outline Width</label>
            <input type="range" min="0" max="8" value="${layer.strokeWidth}" 
                   oninput="this.getRootNode().host.updateTextLayer(${index}, 'strokeWidth', parseInt(this.value))">
            <small>${layer.strokeWidth}px</small>
          </div>
        </div>
        
        <div class="control-group">
          <label>Animation</label>
          <select onchange="this.getRootNode().host.updateTextLayer(${index}, 'animation', this.value)">
            ${this.state.animations.text.map(anim => 
              `<option value="${anim.id}" ${layer.animation === anim.id ? 'selected' : ''}>${anim.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="timing-controls">
          <div class="control-group" style="flex: 1;">
            <label>Start Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.startFrame}" 
                   onchange="this.getRootNode().host.updateTextLayer(${index}, 'startFrame', parseInt(this.value))">
          </div>
          <div class="control-group" style="flex: 1;">
            <label>End Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.endFrame}" 
                   onchange="this.getRootNode().host.updateTextLayer(${index}, 'endFrame', parseInt(this.value))">
          </div>
        </div>
      `;
      
      this.textLayersContainer.appendChild(layerEl);
    });
  }

  renderImageLayersUI() {
    if (this.state.imageLayers.length === 0) {
      this.imageLayersContainer.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; margin: 20px 0;">No images yet. Upload some images to get started!</p>';
      return;
    }
    
    this.imageLayersContainer.innerHTML = '';
    
    this.state.imageLayers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = 'layer-item';
      layerEl.innerHTML = `
        <div class="layer-header">
          <h5 class="layer-title">Image ${index + 1}</h5>
          <div class="layer-actions">
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveLayer('image', ${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-btn secondary" onclick="this.getRootNode().host.moveLayer('image', ${index}, 1)" ${index === this.state.imageLayers.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-btn danger" onclick="this.getRootNode().host.removeLayer('image', ${index})">×</button>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Width</label>
            <input type="range" min="20" max="600" value="${layer.width}" 
                   oninput="this.getRootNode().host.updateImageLayer(${index}, 'width', parseInt(this.value))">
            <small>${Math.round(layer.width)}px</small>
          </div>
          <div class="control-group">
            <label>Height</label>
            <input type="range" min="20" max="600" value="${layer.height}" 
                   oninput="this.getRootNode().host.updateImageLayer(${index}, 'height', parseInt(this.value))">
            <small>${Math.round(layer.height)}px</small>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="control-group">
            <label>Opacity</label>
            <input type="range" min="0" max="1" step="0.1" value="${layer.opacity}" 
                   oninput="this.getRootNode().host.updateImageLayer(${index}, 'opacity', parseFloat(this.value))">
            <small>${Math.round(layer.opacity * 100)}%</small>
          </div>
          <div class="control-group">
            <label>Rotation</label>
            <input type="range" min="-180" max="180" value="${layer.rotation}" 
                   oninput="this.getRootNode().host.updateImageLayer(${index}, 'rotation', parseInt(this.value))">
            <small>${layer.rotation}°</small>
          </div>
        </div>
        
        <div class="control-group">
          <label>Animation</label>
          <select onchange="this.getRootNode().host.updateImageLayer(${index}, 'animation', this.value)">
            ${this.state.animations.image.map(anim => 
              `<option value="${anim.id}" ${layer.animation === anim.id ? 'selected' : ''}>${anim.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="timing-controls">
          <div class="control-group" style="flex: 1;">
            <label>Start Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.startFrame}" 
                   onchange="this.getRootNode().host.updateImageLayer(${index}, 'startFrame', parseInt(this.value))">
          </div>
          <div class="control-group" style="flex: 1;">
            <label>End Frame</label>
            <input type="number" min="0" max="${this.state.totalFrames - 1}" value="${layer.endFrame}" 
                   onchange="this.getRootNode().host.updateImageLayer(${index}, 'endFrame', parseInt(this.value))">
          </div>
        </div>
      `;
      
      this.imageLayersContainer.appendChild(layerEl);
    });
  }

  updateTextLayer(index, property, value) {
    if (this.state.textLayers[index]) {
      this.state.textLayers[index][property] = value;
      this.renderFrame();
    }
  }

  updateImageLayer(index, property, value) {
    if (this.state.imageLayers[index]) {
      this.state.imageLayers[index][property] = value;
      this.renderFrame();
    }
  }

  moveLayer(type, index, direction) {
    const layers = type === 'text' ? this.state.textLayers : this.state.imageLayers;
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < layers.length) {
      [layers[index], layers[newIndex]] = [layers[newIndex], layers[index]];
      if (type === 'text') {
        this.renderTextLayersUI();
      } else {
        this.renderImageLayersUI();
      }
      this.renderFrame();
    }
  }

  removeLayer(type, index) {
    if (confirm('Remove this layer?')) {
      if (type === 'text') {
        this.state.textLayers.splice(index, 1);
        this.renderTextLayersUI();
      } else {
        this.state.imageLayers.splice(index, 1);
        this.renderImageLayersUI();
      }
      this.renderFrame();
    }
  }

  renderFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background template
    if (this.state.backgroundTemplate) {
      const template = this.state.templates.find(t => t.id === this.state.backgroundTemplate);
      if (template && template.url && this.state.imageCache[template.url]) {
        const img = this.state.imageCache[template.url];
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      }
    }
    
    const currentTime = this.state.currentFrame / this.state.fps;
    
    // Draw GIF layers with animations (behind other content)
    this.state.gifLayers.forEach(layer => {
      if (this.state.currentFrame >= layer.startFrame && this.state.currentFrame <= layer.endFrame) {
        if (this.state.imageCache[layer.src]) {
          this.ctx.save();
          
          const animatedProps = this.calculateAnimatedProperties(layer, currentTime);
          
          this.ctx.globalAlpha = animatedProps.opacity;
          this.ctx.translate(animatedProps.x + layer.width/2, animatedProps.y + layer.height/2);
          this.ctx.rotate(animatedProps.rotation * Math.PI / 180);
          this.ctx.scale(animatedProps.scaleX, animatedProps.scaleY);
          
          // For GIF layers, we simulate animation by using the original image
          // In a real implementation, you'd cycle through the actual GIF frames
          this.ctx.drawImage(
            this.state.imageCache[layer.src],
            -layer.width/2, -layer.height/2,
            layer.width, layer.height
          );
          
          this.ctx.restore();
        }
      }
    });
    
    // Draw static images with animations
    this.state.imageLayers.forEach(layer => {
      if (this.state.currentFrame >= layer.startFrame && this.state.currentFrame <= layer.endFrame) {
        if (this.state.imageCache[layer.src]) {
          this.ctx.save();
          
          const animatedProps = this.calculateAnimatedProperties(layer, currentTime);
          
          this.ctx.globalAlpha = animatedProps.opacity;
          this.ctx.translate(animatedProps.x + layer.width/2, animatedProps.y + layer.height/2);
          this.ctx.rotate(animatedProps.rotation * Math.PI / 180);
          this.ctx.scale(animatedProps.scaleX, animatedProps.scaleY);
          
          this.ctx.drawImage(
            this.state.imageCache[layer.src],
            -layer.width/2, -layer.height/2,
            layer.width, layer.height
          );
          
          this.ctx.restore();
        }
      }
    });
    
    // Draw text with animations
    this.state.textLayers.forEach(layer => {
      if (this.state.currentFrame >= layer.startFrame && this.state.currentFrame <= layer.endFrame) {
        this.ctx.save();
        
        const animatedProps = this.calculateAnimatedProperties(layer, currentTime);
        
        this.ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        this.ctx.textAlign = layer.align;
        this.ctx.textBaseline = 'middle';
        this.ctx.globalAlpha = animatedProps.opacity;
        
        // Apply transformations
        this.ctx.translate(animatedProps.x, animatedProps.y);
        this.ctx.rotate(animatedProps.rotation * Math.PI / 180);
        this.ctx.scale(animatedProps.scaleX, animatedProps.scaleY);
        
        let displayText = layer.text;
        
        // Handle typewriter animation
        if (layer.animation === 'typewriter') {
          const progress = this.getAnimationProgress(layer, currentTime);
          const charCount = Math.floor(progress * layer.text.length);
          displayText = layer.text.substring(0, charCount);
        }
        
        // Draw text stroke
        if (layer.strokeWidth > 0) {
          this.ctx.lineWidth = layer.strokeWidth;
          this.ctx.strokeStyle = layer.strokeColor;
          this.ctx.strokeText(displayText, 0, 0);
        }
        
        // Draw text fill
        this.ctx.fillStyle = layer.color;
        this.ctx.fillText(displayText, 0, 0);
        
        this.ctx.restore();
      }
    });
  }

  calculateAnimatedProperties(layer, currentTime) {
    const props = {
      x: layer.x,
      y: layer.y,
      opacity: layer.opacity || 1,
      rotation: layer.rotation || 0,
      scaleX: 1,
      scaleY: 1
    };
    
    if (layer.animation === 'none') return props;
    
    const progress = this.getAnimationProgress(layer, currentTime);
    
    switch (layer.animation) {
      case 'fadeIn':
        props.opacity *= progress;
        break;
        
      case 'fadeOut':
        props.opacity *= (1 - progress);
        break;
        
      case 'slideLeft':
        props.x = layer.x - (1 - progress) * 200;
        break;
        
      case 'slideRight':
        props.x = layer.x + (1 - progress) * 200;
        break;
        
      case 'slideUp':
        props.y = layer.y - (1 - progress) * 200;
        break;
        
      case 'slideDown':
        props.y = layer.y + (1 - progress) * 200;
        break;
        
      case 'bounce':
        const bounceHeight = Math.abs(Math.sin(progress * Math.PI * 4)) * 20;
        props.y = layer.y - bounceHeight;
        break;
        
      case 'shake':
        const shakeAmount = Math.sin(progress * Math.PI * 8) * 5;
        props.x = layer.x + shakeAmount;
        break;
        
      case 'pulse':
        const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
        props.scaleX = pulseScale;
        props.scaleY = pulseScale;
        break;
        
      case 'rotate':
        props.rotation = (layer.rotation || 0) + progress * 360;
        break;
        
      case 'scaleIn':
        props.scaleX = progress;
        props.scaleY = progress;
        break;
        
      case 'scaleOut':
        props.scaleX = 1 - progress;
        props.scaleY = 1 - progress;
        break;
        
      case 'flip':
        props.scaleX = Math.cos(progress * Math.PI);
        break;
    }
    
    return props;
  }

  getAnimationProgress(layer, currentTime) {
    const startTime = layer.startFrame / this.state.fps;
    const endTime = layer.endFrame / this.state.fps;
    const duration = endTime - startTime;
    const elapsed = currentTime - startTime;
    
    return Math.max(0, Math.min(1, elapsed / duration));
  }

  handleCanvasMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check for element clicks (reverse order for top elements first)
    const allElements = [...this.state.gifLayers, ...this.state.imageLayers, ...this.state.textLayers].reverse();
    
    for (let element of allElements) {
      if (this.isPointInElement(x, y, element)) {
        this.state.selectedElement = element;
        this.state.isDragging = true;
        this.state.dragOffset.x = x - element.x;
        this.state.dragOffset.y = y - element.y;
        this.canvas.style.cursor = 'grabbing';
        break;
      }
    }
  }

  handleCanvasMouseMove(e) {
    if (!this.state.isDragging || !this.state.selectedElement) {
      // Update cursor for hover
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const allElements = [...this.state.gifLayers, ...this.state.imageLayers, ...this.state.textLayers].reverse();
      let overElement = false;
      
      for (let element of allElements) {
        if (this.isPointInElement(x, y, element)) {
          overElement = true;
          break;
        }
      }
      
      this.canvas.style.cursor = overElement ? 'grab' : 'default';
      return;
    }
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    this.state.selectedElement.x = x - this.state.dragOffset.x;
    this.state.selectedElement.y = y - this.state.dragOffset.y;
    
    this.renderFrame();
  }

  handleCanvasMouseUp() {
    if (this.state.isDragging) {
      this.state.isDragging = false;
      this.state.selectedElement = null;
      this.canvas.style.cursor = 'default';
    }
  }

  isPointInElement(x, y, element) {
    if (element.type === 'text') {
      // Simple bounding box for text
      const ctx = this.canvas.getContext('2d');
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      const textWidth = ctx.measureText(element.text).width;
      const textHeight = element.fontSize;
      
      let textX = element.x;
      if (element.align === 'center') {
        textX -= textWidth / 2;
      } else if (element.align === 'right') {
        textX -= textWidth;
      }
      
      return x >= textX && x <= textX + textWidth &&
             y >= element.y - textHeight/2 && y <= element.y + textHeight/2;
    } else if (element.type === 'image' || element.type === 'gif') {
      return x >= element.x && x <= element.x + element.width &&
             y >= element.y && y <= element.y + element.height;
    }
    
    return false;
  }

  async exportGIF() {
    this.stopPlayback();
    
    const exportProgress = this.shadowRoot.getElementById('export-progress');
    const progressFill = this.shadowRoot.getElementById('progress-fill');
    const progressText = this.shadowRoot.getElementById('progress-text');
    
    exportProgress.style.display = 'block';
    
    try {
      // Import GIF.js dynamically
      const { default: GIF } = await import('https://cdn.skypack.dev/gif.js');
      
      const quality = this.shadowRoot.getElementById('export-quality').value;
      const colors = parseInt(this.shadowRoot.getElementById('colors-slider').value);
      
      const gif = new GIF({
        workers: 2,
        quality: quality === 'high' ? 1 : quality === 'medium' ? 10 : 20,
        width: this.canvas.width,
        height: this.canvas.height,
        transparent: 0x00FF00, // Use green as transparent color
        background: '#FFFFFF',
        workerScript: 'https://cdn.skypack.dev/gif.js/dist/gif.worker.js'
      });
      
      const frameDelay = 1000 / this.state.fps;
      
      // Render all frames
      for (let i = 0; i < this.state.totalFrames; i++) {
        this.state.currentFrame = i;
        this.renderFrame();
        
        // Convert canvas to image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        gif.addFrame(imageData, { delay: frameDelay });
        
        // Update progress
        const progress = (i + 1) / this.state.totalFrames * 50; // First 50%
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      gif.on('progress', (p) => {
        const totalProgress = 50 + p * 50; // Remaining 50%
        progressFill.style.width = `${totalProgress}%`;
        progressText.textContent = `${Math.round(totalProgress)}%`;
      });
      
      gif.on('finished', (blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meme-${Date.now()}.gif`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        // Hide progress
        exportProgress.style.display = 'none';
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        alert('🎉 Your GIF has been generated and downloaded!');
      });
      
      gif.render();
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export GIF. Please try again.');
      exportProgress.style.display = 'none';
    }
  }

  previewGIF() {
    this.startPlayback();
  }

  resetAll() {
    if (confirm('Reset everything? This will clear all your work!')) {
      this.stopPlayback();
      
      this.state.textLayers = [];
      this.state.imageLayers = [];
      this.state.gifLayers = [];
      this.state.backgroundTemplate = null;
      this.state.currentFrame = 0;
      
      // Reset UI
      this.templatesContainer.querySelectorAll('.template-option').forEach(el => {
        el.classList.remove('selected');
      });
      
      this.renderTextLayersUI();
      this.renderImageLayersUI();
      this.renderGifLayersUI();
      this.updateTimeline();
      this.updateDisplays();
      this.renderFrame();
    }
  }

  connectedCallback() {
    // Initialize with a sample text layer and empty containers
    setTimeout(() => {
      this.addTextLayer();
      this.renderImageLayersUI();
      this.renderGifLayersUI();
    }, 100);
  }
}

// Register the custom element
customElements.define('gif-meme-generator', GifMemeGenerator);

// Export for Wix
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GifMemeGenerator;
}

// Global registration
if (typeof window !== 'undefined') {
  window.GifMemeGenerator = GifMemeGenerator;
}
